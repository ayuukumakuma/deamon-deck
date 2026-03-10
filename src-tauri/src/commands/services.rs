use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use std::time::SystemTime;

use crate::error::AppError;
use crate::models::service::{Service, ServiceStatus};

struct LaunchctlEntry {
    pid: Option<u32>,
    exit_status: i32,
}

struct CachedPlist {
    modified: SystemTime,
    service: Service,
}

static PLIST_CACHE: std::sync::LazyLock<Mutex<HashMap<PathBuf, CachedPlist>>> =
    std::sync::LazyLock::new(|| Mutex::new(HashMap::new()));

fn get_string(dict: &plist::Dictionary, key: &str) -> Option<String> {
    dict.get(key)
        .and_then(|v| v.as_string())
        .map(|s| s.to_string())
}

fn get_string_array(dict: &plist::Dictionary, key: &str) -> Option<Vec<String>> {
    dict.get(key).and_then(|v| {
        v.as_array().map(|arr| {
            arr.iter()
                .filter_map(|item| item.as_string().map(|s| s.to_string()))
                .collect()
        })
    })
}

fn get_bool(dict: &plist::Dictionary, key: &str) -> bool {
    dict.get(key).and_then(|v| v.as_boolean()).unwrap_or(false)
}

fn parse_plist_file(path: &std::path::Path) -> Option<Service> {
    let value = match plist::Value::from_file(path) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("Warning: failed to parse {}: {}", path.display(), e);
            return None;
        }
    };

    let dict = match value.as_dictionary() {
        Some(d) => d,
        None => {
            eprintln!("Warning: {} is not a dictionary", path.display());
            return None;
        }
    };

    let label = match get_string(dict, "Label") {
        Some(l) => l,
        None => {
            eprintln!("Warning: {} has no Label", path.display());
            return None;
        }
    };

    Some(Service {
        label,
        status: ServiceStatus::NotLoaded,
        pid: None,
        last_exit_status: None,
        plist_path: path.to_string_lossy().to_string(),
        program: get_string(dict, "Program"),
        program_arguments: get_string_array(dict, "ProgramArguments"),
        standard_out_path: get_string(dict, "StandardOutPath"),
        standard_error_path: get_string(dict, "StandardErrorPath"),
        run_at_load: get_bool(dict, "RunAtLoad"),
        keep_alive: get_bool(dict, "KeepAlive"),
        start_interval: dict
            .get("StartInterval")
            .and_then(|v| v.as_unsigned_integer()),
        has_start_calendar_interval: dict.contains_key("StartCalendarInterval"),
    })
}

fn scan_plist_files() -> Result<Vec<Service>, AppError> {
    let home = dirs::home_dir().ok_or(AppError::ConfigError(
        "Could not determine home directory".to_string(),
    ))?;
    let launch_agents_dir = home.join("Library/LaunchAgents");

    let entries = match std::fs::read_dir(&launch_agents_dir) {
        Ok(entries) => entries,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(vec![]),
        Err(e) => return Err(e.into()),
    };

    let mut cache = PLIST_CACHE.lock().unwrap();
    let mut current_paths = HashSet::new();
    let mut services = Vec::new();

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.extension().and_then(|e| e.to_str()) != Some("plist") {
            continue;
        }

        current_paths.insert(path.clone());

        let modified = entry.metadata().ok().and_then(|m| m.modified().ok());

        if let (Some(modified), Some(cached)) = (modified, cache.get(&path)) {
            if cached.modified == modified {
                services.push(cached.service.clone());
                continue;
            }
        }

        if let Some(service) = parse_plist_file(&path) {
            if let Some(modified) = modified {
                cache.insert(
                    path,
                    CachedPlist {
                        modified,
                        service: service.clone(),
                    },
                );
            }
            services.push(service);
        }
    }

    // Remove stale cache entries for deleted files
    cache.retain(|p, _| current_paths.contains(p));

    Ok(services)
}

fn parse_launchctl_list() -> Result<HashMap<String, LaunchctlEntry>, AppError> {
    let output = Command::new("launchctl").arg("list").output()?;

    if !output.status.success() {
        return Err(AppError::LaunchctlError(
            "launchctl list failed".to_string(),
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut map = HashMap::new();

    for line in stdout.lines().skip(1) {
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() < 3 {
            continue;
        }

        let pid = if parts[0] == "-" {
            None
        } else {
            parts[0].parse::<u32>().ok()
        };

        let exit_status = parts[1].parse::<i32>().unwrap_or(0);
        let label = parts[2].to_string();

        map.insert(label, LaunchctlEntry { pid, exit_status });
    }

    Ok(map)
}

fn build_service_list() -> Result<Vec<Service>, AppError> {
    let mut services = scan_plist_files()?;
    let launchctl_map = parse_launchctl_list().unwrap_or_default();

    for service in &mut services {
        if let Some(entry) = launchctl_map.get(&service.label) {
            match entry {
                LaunchctlEntry { pid: Some(pid), .. } => {
                    service.status = ServiceStatus::Running;
                    service.pid = Some(*pid);
                }
                LaunchctlEntry {
                    exit_status,
                    pid: None,
                } if *exit_status != 0 => {
                    service.status = ServiceStatus::Error;
                    service.last_exit_status = Some(*exit_status);
                }
                _ => {
                    service.status = ServiceStatus::Stopped;
                }
            }
        }
    }

    services.sort_by(|a, b| a.label.cmp(&b.label));

    Ok(services)
}

#[tauri::command]
pub fn list_services() -> Result<Vec<Service>, AppError> {
    build_service_list()
}
