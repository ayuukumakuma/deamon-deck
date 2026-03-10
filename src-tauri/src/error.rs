use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Plist parse error: {0}")]
    PlistParseError(#[from] plist::Error),
    #[error("Service not found: {0}")]
    NotFound(String),
    #[error("launchctl error: {0}")]
    LaunchctlError(String),
    #[error("Configuration error: {0}")]
    ConfigError(String),
    #[error("Log stream error: {0}")]
    LogStreamError(String),
    #[error("Watch error: {0}")]
    WatchError(#[from] notify::Error),
}

impl From<AppError> for tauri::ipc::InvokeError {
    fn from(e: AppError) -> Self {
        let msg = match &e {
            AppError::LaunchctlError(msg) => {
                if msg.contains("Could not find specified service") {
                    "Service is not currently loaded. Try loading it first.".into()
                } else if msg.contains("Operation not permitted") {
                    "Permission denied. This service may require elevated privileges.".into()
                } else if msg.contains("No such process") {
                    "The service process is not running.".into()
                } else if msg.contains("Service is disabled") {
                    "Service is disabled. Enable it before starting.".into()
                } else if msg.contains("Already loaded") || msg.contains("already loaded") {
                    "Service is already loaded.".into()
                } else {
                    format!("launchctl error: {msg}")
                }
            }
            _ => e.to_string(),
        };
        tauri::ipc::InvokeError::from(msg)
    }
}
