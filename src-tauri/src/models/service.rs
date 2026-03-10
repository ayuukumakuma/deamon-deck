use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ServiceStatus {
    Running,
    Stopped,
    Error,
    NotLoaded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Service {
    pub label: String,
    pub status: ServiceStatus,
    pub pid: Option<u32>,
    pub last_exit_status: Option<i32>,
    pub plist_path: String,
    pub program: Option<String>,
    pub program_arguments: Option<Vec<String>>,
    pub standard_out_path: Option<String>,
    pub standard_error_path: Option<String>,
    pub run_at_load: bool,
    pub keep_alive: bool,
    pub start_interval: Option<u64>,
    pub has_start_calendar_interval: bool,
}
