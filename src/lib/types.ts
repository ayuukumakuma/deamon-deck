export type ServiceStatus = "Running" | "Stopped" | "Error" | "NotLoaded";

export const STATUS_CONFIG: { status: ServiceStatus; colorVar: string }[] = [
  { status: "Running", colorVar: "--color-status-running" },
  { status: "Stopped", colorVar: "--color-status-stopped" },
  { status: "Error", colorVar: "--color-status-error" },
  { status: "NotLoaded", colorVar: "--color-status-not-loaded" },
];

export type PlistValue =
  | { type: "String"; value: string }
  | { type: "Integer"; value: number }
  | { type: "Real"; value: number }
  | { type: "Boolean"; value: boolean }
  | { type: "Array"; value: PlistValue[] }
  | { type: "Dict"; value: [string, PlistValue][] }
  | { type: "Data"; value: number[] }
  | { type: "Date"; value: string };

export interface PlistDocument {
  entries: [string, PlistValue][];
}

export type TabKey = "detail" | "editor" | "logs";

export interface Service {
  label: string;
  status: ServiceStatus;
  pid: number | null;
  lastExitStatus: number | null;
  plistPath: string;
  program: string | null;
  programArguments: string[] | null;
  standardOutPath: string | null;
  standardErrorPath: string | null;
  runAtLoad: boolean;
  keepAlive: boolean;
  startInterval: number | null;
  hasStartCalendarInterval: boolean;
}

export function getServiceProgram(service: Service): string | null {
  return service.program ?? service.programArguments?.[0] ?? null;
}

export function getServiceProgramFull(service: Service): string {
  return service.program ?? service.programArguments?.join(" ") ?? "-";
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning";
  message: string;
  duration?: number;
}

export type LogSource = "stdout" | "stderr" | "system";

export interface LogLine {
  content: string;
  source: LogSource;
  timestamp: string | null;
}
