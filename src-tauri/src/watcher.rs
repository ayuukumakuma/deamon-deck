use notify::{EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::sync::mpsc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

const DEBOUNCE: Duration = Duration::from_millis(500);

pub fn start_watcher(app: AppHandle) -> Result<RecommendedWatcher, crate::error::AppError> {
    let (tx, rx) = mpsc::channel::<()>();

    let mut watcher =
        notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
            if let Ok(event) = res {
                let is_relevant = matches!(
                    event.kind,
                    EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_)
                );
                let is_plist = event
                    .paths
                    .iter()
                    .any(|p| p.extension().and_then(|e| e.to_str()) == Some("plist"));
                if is_relevant && is_plist {
                    let _ = tx.send(());
                }
            }
        })?;

    let launch_agents = dirs::home_dir()
        .expect("home directory not found")
        .join("Library/LaunchAgents");

    if launch_agents.exists() {
        watcher.watch(&launch_agents, RecursiveMode::NonRecursive)?;
    }

    // Debounce: wait for a quiet period before emitting
    std::thread::spawn(move || {
        while rx.recv().is_ok() {
            // Drain events until quiet for DEBOUNCE duration
            while rx.recv_timeout(DEBOUNCE).is_ok() {}
            let _ = app.emit("services-changed", ());
        }
    });

    Ok(watcher)
}
