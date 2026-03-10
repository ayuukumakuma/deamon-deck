use std::io::Cursor;
use std::path::Path;

use crate::commands::launchctl;
use crate::commands::logs::LogStreamState;
use crate::error::AppError;
use crate::models::plist_data::{PlistDocument, PlistValue};

#[tauri::command]
pub fn read_plist(path: String) -> Result<PlistDocument, AppError> {
    let value = plist::Value::from_file(&path)?;
    PlistDocument::from_plist_value(value)
}

#[tauri::command]
pub fn write_plist(path: String, data: PlistDocument) -> Result<(), AppError> {
    let file_path = Path::new(&path);
    if file_path.exists() {
        let backup_path = format!("{}.bak", path);
        std::fs::copy(file_path, &backup_path)?;
    }
    let value = data.to_plist_value();
    plist::to_file_xml(&path, &value)?;
    Ok(())
}

fn check_type(
    data: &PlistDocument,
    key: &str,
    check: fn(&PlistValue) -> bool,
    expected: &str,
    errors: &mut Vec<String>,
) {
    if let Some(v) = data.get(key) {
        if !check(v) {
            errors.push(format!("{key} must be {expected}"));
        }
    }
}

#[tauri::command]
pub fn validate_plist(data: PlistDocument) -> Result<Vec<String>, AppError> {
    let mut errors = Vec::new();

    match data.get("Label") {
        Some(PlistValue::String(s)) if s.is_empty() => {
            errors.push("Label must not be empty".into());
        }
        Some(PlistValue::String(_)) => {}
        Some(_) => {
            errors.push("Label must be a string".into());
        }
        None => {
            errors.push("Label is required".into());
        }
    }

    check_type(&data, "ProgramArguments", |v| matches!(v, PlistValue::Array(_)), "an array", &mut errors);
    check_type(&data, "StartInterval", |v| matches!(v, PlistValue::Integer(_)), "an integer", &mut errors);
    check_type(&data, "RunAtLoad", |v| matches!(v, PlistValue::Boolean(_)), "a boolean", &mut errors);
    check_type(&data, "KeepAlive", |v| matches!(v, PlistValue::Boolean(_)), "a boolean", &mut errors);
    check_type(&data, "EnvironmentVariables", |v| matches!(v, PlistValue::Dict(_)), "a dictionary", &mut errors);

    Ok(errors)
}

#[tauri::command]
pub fn create_plist(data: PlistDocument) -> Result<String, AppError> {
    let label = match data.get("Label") {
        Some(PlistValue::String(s)) if !s.is_empty() => s.clone(),
        _ => return Err(AppError::ConfigError("Label is required and must be a non-empty string".into())),
    };

    let home = dirs::home_dir()
        .ok_or_else(|| AppError::ConfigError("Could not determine home directory".into()))?;
    let path = home
        .join("Library/LaunchAgents")
        .join(format!("{}.plist", label));

    if path.exists() {
        return Err(AppError::ConfigError(format!(
            "Plist file already exists: {}",
            path.display()
        )));
    }

    let value = data.to_plist_value();
    plist::to_file_xml(&path, &value)?;

    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn plist_to_xml(data: PlistDocument) -> Result<String, AppError> {
    let value = data.to_plist_value();
    let mut buf = Cursor::new(Vec::new());
    plist::to_writer_xml(&mut buf, &value)?;
    let xml = String::from_utf8(buf.into_inner())
        .map_err(|e| AppError::ConfigError(format!("UTF-8 error: {}", e)))?;
    Ok(xml)
}

#[tauri::command]
pub fn xml_to_plist(xml: String) -> Result<PlistDocument, AppError> {
    let value = plist::Value::from_reader_xml(Cursor::new(xml.as_bytes()))?;
    PlistDocument::from_plist_value(value)
}

#[tauri::command]
pub async fn delete_service(
    plist_path: String,
    label: String,
    create_backup: bool,
    log_state: tauri::State<'_, LogStreamState>,
) -> Result<(), AppError> {
    let file_path = Path::new(&plist_path);
    if !file_path.exists() {
        return Err(AppError::NotFound(format!(
            "Plist file not found: {}",
            plist_path
        )));
    }

    // Stop any active log stream for this service
    log_state.cancel_stream(&label);

    // Try to unload the service (ignore failures — it may not be loaded)
    let target = launchctl::gui_target(&label);
    let _ = launchctl::run_with_fallback(&["bootout", &target], &["unload", &plist_path]);

    // Create backup before deletion if requested
    if create_backup {
        let backup_path = format!("{}.bak", plist_path);
        std::fs::copy(file_path, &backup_path)?;
    }

    // Delete the plist file
    std::fs::remove_file(file_path)?;

    Ok(())
}
