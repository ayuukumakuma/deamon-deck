use std::collections::HashMap;
use std::io::{BufRead, BufReader, Read, Seek, SeekFrom};
use std::path::Path;
use std::sync::Mutex;

use notify::{RecursiveMode, Watcher};
use tauri::ipc::Channel;
use tokio_util::sync::CancellationToken;

use crate::error::AppError;
use crate::models::log_line::{LogLine, LogSource};

#[derive(Default)]
pub struct LogStreamState {
    streams: Mutex<HashMap<String, CancellationToken>>,
}

impl LogStreamState {
    pub(crate) fn cancel_stream(&self, label: &str) {
        let mut streams = self.streams.lock().unwrap();
        if let Some(token) = streams.remove(label) {
            token.cancel();
        }
    }

    fn register_stream(&self, label: String, token: CancellationToken) {
        self.streams.lock().unwrap().insert(label, token);
    }
}

fn now_timestamp() -> String {
    chrono::Local::now().format("%H:%M:%S").to_string()
}

fn send_log_line(channel: &Channel<LogLine>, content: String, source: LogSource) {
    let _ = channel.send(LogLine {
        content,
        source,
        timestamp: Some(now_timestamp()),
    });
}

/// Read the last `n` lines from a file by reading backwards in chunks.
/// Returns a BufReader positioned at EOF for subsequent tailing.
fn open_and_read_tail(
    path: &str,
    n: usize,
) -> Option<(Vec<String>, BufReader<std::fs::File>)> {
    let file = std::fs::File::open(path).ok()?;
    let file_size = file.metadata().ok()?.len();

    if file_size == 0 {
        return Some((vec![], BufReader::new(file)));
    }

    let mut reader = BufReader::new(file);
    let chunk_size: u64 = 8192;
    let mut pos = file_size;
    let mut tail_bytes = Vec::new();
    let mut newline_count = 0;

    while pos > 0 && newline_count <= n {
        let read_size = chunk_size.min(pos);
        pos -= read_size;
        reader.seek(SeekFrom::Start(pos)).ok()?;
        let mut buf = vec![0u8; read_size as usize];
        reader.read_exact(&mut buf).ok()?;
        newline_count += buf.iter().filter(|&&b| b == b'\n').count();
        tail_bytes.splice(0..0, buf);
    }

    let text = String::from_utf8_lossy(&tail_bytes);
    let all_lines: Vec<&str> = text.lines().collect();
    let start = if all_lines.len() > n {
        all_lines.len() - n
    } else {
        0
    };
    let lines = all_lines[start..]
        .iter()
        .filter(|l| !l.is_empty())
        .map(|l| l.to_string())
        .collect();

    // Seek to end for tailing
    reader.seek(SeekFrom::End(0)).ok()?;

    Some((lines, reader))
}

async fn tail_file(
    path: String,
    source: LogSource,
    channel: Channel<LogLine>,
    token: CancellationToken,
) {
    let (initial_lines, mut reader) = match open_and_read_tail(&path, 50) {
        Some(result) => result,
        None => {
            send_log_line(
                &channel,
                format!("Log file not found: {}", path),
                LogSource::System,
            );
            return;
        }
    };

    // Send initial lines with a single timestamp
    let ts = now_timestamp();
    for line in initial_lines {
        let _ = channel.send(LogLine {
            content: line,
            source: source.clone(),
            timestamp: Some(ts.clone()),
        });
    }

    // Set up notify watcher bridged via mpsc channel
    let (tx, mut rx) = tokio::sync::mpsc::channel::<()>(100);
    let tx_clone = tx.clone();
    let mut watcher = match notify::recommended_watcher(
        move |res: Result<notify::Event, notify::Error>| {
            if let Ok(event) = res {
                if event.kind.is_modify() {
                    let _ = tx_clone.blocking_send(());
                }
            }
        },
    ) {
        Ok(w) => w,
        Err(_) => return,
    };

    if watcher
        .watch(Path::new(&path), RecursiveMode::NonRecursive)
        .is_err()
    {
        return;
    }

    // Drop our handle so only the watcher callback's clone keeps the channel alive
    drop(tx);

    let mut line_buf = String::new();
    loop {
        tokio::select! {
            _ = token.cancelled() => break,
            msg = rx.recv() => {
                if msg.is_none() {
                    break;
                }
                // Check for file truncation
                if let Ok(metadata) = std::fs::metadata(&path) {
                    let current_pos = reader.stream_position().unwrap_or(0);
                    if metadata.len() < current_pos {
                        if let Ok(new_file) = std::fs::File::open(&path) {
                            reader = BufReader::new(new_file);
                        }
                    }
                }
                // Read all available new lines
                loop {
                    line_buf.clear();
                    match reader.read_line(&mut line_buf) {
                        Ok(0) => break,
                        Ok(_) => {
                            let content = line_buf.trim_end().to_string();
                            if !content.is_empty() {
                                send_log_line(&channel, content, source.clone());
                            }
                        }
                        Err(_) => break,
                    }
                }
            }
        }
    }

    drop(watcher);
}

async fn tail_log_stream(
    process_name: String,
    channel: Channel<LogLine>,
    token: CancellationToken,
) {
    use tokio::io::{AsyncBufReadExt, BufReader};
    use tokio::process::Command;

    let predicate = format!("process == \"{}\"", process_name);
    let mut child = match Command::new("log")
        .args(["stream", "--predicate", &predicate, "--style", "compact"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::null())
        .spawn()
    {
        Ok(c) => c,
        Err(e) => {
            send_log_line(
                &channel,
                format!("Failed to start log stream: {}", e),
                LogSource::System,
            );
            return;
        }
    };

    let stdout = child.stdout.take().unwrap();
    let mut reader = BufReader::new(stdout).lines();

    loop {
        tokio::select! {
            _ = token.cancelled() => {
                let _ = child.kill().await;
                break;
            }
            result = reader.next_line() => {
                match result {
                    Ok(Some(line)) => {
                        send_log_line(&channel, line, LogSource::System);
                    }
                    Ok(None) | Err(_) => break,
                }
            }
        }
    }
}

#[tauri::command]
pub async fn start_log_stream(
    label: String,
    stdout_path: Option<String>,
    stderr_path: Option<String>,
    process_name: Option<String>,
    on_event: Channel<LogLine>,
    state: tauri::State<'_, LogStreamState>,
) -> Result<(), AppError> {
    state.cancel_stream(&label);

    let token = CancellationToken::new();
    state.register_stream(label.clone(), token.clone());

    if stdout_path.is_some() || stderr_path.is_some() {
        if let Some(path) = stdout_path {
            let ch = on_event.clone();
            let tk = token.clone();
            tauri::async_runtime::spawn(tail_file(path, LogSource::Stdout, ch, tk));
        }
        if let Some(path) = stderr_path {
            let ch = on_event.clone();
            let tk = token.clone();
            tauri::async_runtime::spawn(tail_file(path, LogSource::Stderr, ch, tk));
        }
    } else if let Some(proc_name) = process_name {
        tauri::async_runtime::spawn(tail_log_stream(
            proc_name,
            on_event.clone(),
            token.clone(),
        ));
    } else {
        send_log_line(
            &on_event,
            "No log paths configured for this service. Set StandardOutPath or StandardErrorPath in the plist.".to_string(),
            LogSource::System,
        );
    }

    Ok(())
}

#[tauri::command]
pub async fn stop_log_stream(
    label: String,
    state: tauri::State<'_, LogStreamState>,
) -> Result<(), AppError> {
    state.cancel_stream(&label);
    Ok(())
}
