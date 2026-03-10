mod commands;
mod error;
mod models;
mod watcher;

use commands::logs::LogStreamState;
use tauri::Manager;
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .manage(LogStreamState::default())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window("main") {
                if let Err(e) = apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, None) {
                    eprintln!("Warning: failed to apply vibrancy: {e}");
                }
            }

            let watcher = watcher::start_watcher(app.handle().clone())?;
            app.manage(watcher);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::services::list_services,
            commands::launchctl::load_service,
            commands::launchctl::unload_service,
            commands::launchctl::start_service,
            commands::launchctl::stop_service,
            commands::launchctl::restart_service,
            commands::launchctl::enable_service,
            commands::launchctl::disable_service,
            commands::plist::read_plist,
            commands::plist::write_plist,
            commands::plist::validate_plist,
            commands::plist::create_plist,
            commands::plist::plist_to_xml,
            commands::plist::xml_to_plist,
            commands::plist::delete_service,
            commands::logs::start_log_stream,
            commands::logs::stop_log_stream,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
