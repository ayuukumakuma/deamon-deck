import { type Locale, translate } from "./i18n";
import type { PlistValue, Service, ServiceStatus } from "./types";

function getPlistBool(entries: [string, PlistValue][], key: string): boolean | undefined {
  const entry = entries.find(([k]) => k === key);
  if (entry && entry[1].type === "Boolean") return entry[1].value;
  return undefined;
}

function getPlistInt(entries: [string, PlistValue][], key: string): number | undefined {
  const entry = entries.find(([k]) => k === key);
  if (entry && entry[1].type === "Integer") return entry[1].value;
  return undefined;
}

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_JA = ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"];

function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  return translate(locale, key, params);
}

function formatInterval(seconds: number, locale: Locale): string {
  if (seconds < 60) {
    return t(locale, "humanize.every", { value: t(locale, "humanize.seconds", { n: seconds }) });
  }
  if (seconds < 3600) {
    const min = Math.floor(seconds / 60);
    const rem = seconds % 60;
    const base = t(locale, "humanize.minutes", { n: min });
    if (rem === 0) return t(locale, "humanize.every", { value: base });
    const remStr = t(locale, "humanize.seconds", { n: rem });
    return t(locale, "humanize.every", { value: `${base}${remStr}` });
  }
  if (seconds < 86400) {
    const hr = Math.floor(seconds / 3600);
    const rem = seconds % 3600;
    const base = t(locale, "humanize.hours", { n: hr });
    const minRem = Math.floor(rem / 60);
    if (minRem === 0) return t(locale, "humanize.every", { value: base });
    const remStr = t(locale, "humanize.minutes", { n: minRem });
    return t(locale, "humanize.every", { value: `${base}${remStr}` });
  }
  const days = Math.floor(seconds / 86400);
  const base = t(locale, "humanize.days", { n: days });
  return t(locale, "humanize.every", { value: base });
}

function formatCalendarInterval(dict: [string, PlistValue][], locale: Locale): string {
  const weekday = getPlistInt(dict, "Weekday");
  const month = getPlistInt(dict, "Month");
  const day = getPlistInt(dict, "Day");
  const hour = getPlistInt(dict, "Hour") ?? 0;
  const minute = getPlistInt(dict, "Minute") ?? 0;
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const weekdays = locale === "ja" ? WEEKDAYS_JA : WEEKDAYS_EN;

  if (month != null && day != null) {
    return t(locale, "humanize.runsYearly", { month, day, time });
  }
  if (day != null) {
    return t(locale, "humanize.runsMonthly", { day, time });
  }
  if (weekday != null) {
    const wd = weekdays[weekday] ?? `${weekday}`;
    return t(locale, "humanize.runsWeekly", { weekday: wd, time });
  }
  return t(locale, "humanize.runsDaily", { time });
}

export function humanizeRunSchedule(entries: [string, PlistValue][], locale: Locale): string[] {
  const results: string[] = [];

  if (getPlistBool(entries, "RunAtLoad") === true) {
    results.push(t(locale, "humanize.runAtLoad"));
  }

  if (getPlistBool(entries, "KeepAlive") === true) {
    results.push(t(locale, "humanize.keepAlive"));
  }

  const startInterval = getPlistInt(entries, "StartInterval");
  if (startInterval != null) {
    results.push(formatInterval(startInterval, locale));
  }

  const calendarEntry = entries.find(([k]) => k === "StartCalendarInterval");
  if (calendarEntry) {
    const val = calendarEntry[1];
    if (val.type === "Dict") {
      results.push(formatCalendarInterval(val.value, locale));
    } else if (val.type === "Array") {
      for (const item of val.value) {
        if (item.type === "Dict") {
          results.push(formatCalendarInterval(item.value, locale));
        }
      }
    }
  }

  return results;
}

export function humanizeStatus(
  status: ServiceStatus,
  pid: number | null,
  lastExitStatus: number | null,
  locale: Locale,
): string {
  switch (status) {
    case "Running":
      return pid != null
        ? t(locale, "humanize.statusRunningPid", { pid })
        : t(locale, "humanize.statusRunning");
    case "Stopped":
      return t(locale, "humanize.statusStopped");
    case "Error":
      return lastExitStatus != null
        ? t(locale, "humanize.statusErrorCode", { code: lastExitStatus })
        : t(locale, "humanize.statusError");
    case "NotLoaded":
      return t(locale, "humanize.statusNotLoaded");
  }
}

export function buildScheduleSummary(service: Service, locale: Locale): string[] {
  const results: string[] = [];
  if (service.runAtLoad) {
    results.push(t(locale, "humanize.runAtLoad"));
  }
  if (service.keepAlive) {
    results.push(t(locale, "humanize.keepAlive"));
  }
  if (service.startInterval != null) {
    results.push(formatInterval(service.startInterval, locale));
  }
  if (service.hasStartCalendarInterval) {
    results.push(t(locale, "humanize.scheduledExecution"));
  }
  return results;
}

export function humanizeProgram(program: string | null, programArguments: string[] | null): string {
  if (program) {
    return program.split("/").pop() ?? program;
  }
  if (programArguments && programArguments.length > 0) {
    const name = programArguments[0].split("/").pop() ?? programArguments[0];
    const args = programArguments.slice(1);
    if (args.length === 0) return name;
    const argsStr = args.join(" ");
    if (argsStr.length > 40) return `${name} ${argsStr.slice(0, 37)}...`;
    return `${name} ${argsStr}`;
  }
  return "-";
}
