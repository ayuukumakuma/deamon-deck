use std::process::Command;
use std::sync::OnceLock;
use std::thread;
use std::time::Duration;

use crate::error::AppError;

fn get_uid() -> u32 {
    static UID: OnceLock<u32> = OnceLock::new();
    *UID.get_or_init(|| unsafe { libc::getuid() })
}

fn run_launchctl(args: &[&str]) -> Result<(), AppError> {
    let output = Command::new("launchctl").args(args).output()?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let msg = if stderr.is_empty() {
            format!(
                "launchctl {} failed with exit code {:?}",
                args.join(" "),
                output.status.code()
            )
        } else {
            stderr
        };
        return Err(AppError::LaunchctlError(msg));
    }
    Ok(())
}

/// Tries `modern_args` first, falls back to `legacy_args` on failure.
pub(crate) fn run_with_fallback(modern_args: &[&str], legacy_args: &[&str]) -> Result<(), AppError> {
    run_launchctl(modern_args).or_else(|_| run_launchctl(legacy_args))
}

pub(crate) fn gui_target(label: &str) -> String {
    format!("gui/{}/{}", get_uid(), label)
}

fn gui_domain() -> String {
    format!("gui/{}", get_uid())
}

#[tauri::command]
pub fn load_service(plist_path: String) -> Result<(), AppError> {
    let domain = gui_domain();
    run_with_fallback(
        &["bootstrap", &domain, &plist_path],
        &["load", &plist_path],
    )
}

#[tauri::command]
pub fn unload_service(label: String, plist_path: String) -> Result<(), AppError> {
    let target = gui_target(&label);
    run_with_fallback(&["bootout", &target], &["unload", &plist_path])
}

#[tauri::command]
pub fn start_service(label: String) -> Result<(), AppError> {
    let target = gui_target(&label);
    run_with_fallback(&["kickstart", &target], &["start", &label])
}

#[tauri::command]
pub fn stop_service(label: String) -> Result<(), AppError> {
    let target = gui_target(&label);
    run_with_fallback(&["kill", "SIGTERM", &target], &["stop", &label])
}

#[tauri::command]
pub fn restart_service(label: String) -> Result<(), AppError> {
    let target = gui_target(&label);
    // Modern: kickstart -k kills and restarts atomically
    // Legacy fallback: stop → delay → start
    match run_launchctl(&["kickstart", "-k", &target]) {
        Ok(()) => Ok(()),
        Err(_) => {
            let _ = run_launchctl(&["stop", &label]);
            thread::sleep(Duration::from_millis(500));
            run_launchctl(&["start", &label])
        }
    }
}

#[tauri::command]
pub fn enable_service(label: String) -> Result<(), AppError> {
    let target = gui_target(&label);
    run_launchctl(&["enable", &target])
}

#[tauri::command]
pub fn disable_service(label: String) -> Result<(), AppError> {
    let target = gui_target(&label);
    run_launchctl(&["disable", &target])
}
