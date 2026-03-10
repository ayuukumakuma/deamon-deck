import { Channel, invoke } from "@tauri-apps/api/core";
import type { LogLine, PlistDocument, Service } from "./types";

export async function listServices(): Promise<Service[]> {
  return invoke<Service[]>("list_services");
}

export async function loadService(plistPath: string): Promise<void> {
  return invoke("load_service", { plistPath });
}

export async function unloadService(label: string, plistPath: string): Promise<void> {
  return invoke("unload_service", { label, plistPath });
}

export async function startService(label: string): Promise<void> {
  return invoke("start_service", { label });
}

export async function stopService(label: string): Promise<void> {
  return invoke("stop_service", { label });
}

export async function restartService(label: string): Promise<void> {
  return invoke("restart_service", { label });
}

export async function enableService(label: string): Promise<void> {
  return invoke("enable_service", { label });
}

export async function disableService(label: string): Promise<void> {
  return invoke("disable_service", { label });
}

export async function readPlist(path: string): Promise<PlistDocument> {
  return invoke<PlistDocument>("read_plist", { path });
}

export async function writePlist(path: string, data: PlistDocument): Promise<void> {
  return invoke("write_plist", { path, data });
}

export async function validatePlist(data: PlistDocument): Promise<string[]> {
  return invoke<string[]>("validate_plist", { data });
}

export async function createPlist(data: PlistDocument): Promise<string> {
  return invoke<string>("create_plist", { data });
}

export async function plistToXml(data: PlistDocument): Promise<string> {
  return invoke<string>("plist_to_xml", { data });
}

export async function xmlToPlist(xml: string): Promise<PlistDocument> {
  return invoke<PlistDocument>("xml_to_plist", { xml });
}

export async function deleteService(
  label: string,
  plistPath: string,
  createBackup: boolean,
): Promise<void> {
  return invoke("delete_service", { label, plistPath, createBackup });
}

export function startLogStream(
  label: string,
  stdoutPath: string | null,
  stderrPath: string | null,
  processName: string | null,
  onEvent: (line: LogLine) => void,
): { promise: Promise<void>; channel: Channel<LogLine> } {
  const channel = new Channel<LogLine>();
  channel.onmessage = onEvent;
  const promise = invoke<void>("start_log_stream", {
    label,
    stdoutPath,
    stderrPath,
    processName,
    onEvent: channel,
  });
  return { promise, channel };
}

export async function stopLogStream(label: string): Promise<void> {
  return invoke("stop_log_stream", { label });
}
