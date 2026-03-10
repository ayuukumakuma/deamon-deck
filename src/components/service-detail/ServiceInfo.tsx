import { useEffect, useState } from "react";
import { readPlist } from "../../lib/commands";
import {
  buildScheduleSummary,
  humanizeProgram,
  humanizeRunSchedule,
  humanizeStatus,
} from "../../lib/humanize";
import { useTranslation } from "../../lib/i18n";
import { getServiceProgramFull, type Service } from "../../lib/types";
import { StatusBadge } from "../service-list/StatusBadge";

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-[var(--color-border)]">
      <dt className="w-36 shrink-0 text-sm text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="text-sm text-[var(--color-text-primary)] break-all">{children}</dd>
    </div>
  );
}

const STATUS_COLOR_MAP: Record<string, string> = {
  Running: "var(--color-status-running)",
  Stopped: "var(--color-status-stopped)",
  Error: "var(--color-status-error)",
  NotLoaded: "var(--color-status-not-loaded)",
};

function SummaryCard({ service }: { service: Service }) {
  const { t, locale } = useTranslation();
  const [scheduleLines, setScheduleLines] = useState<string[]>(() =>
    buildScheduleSummary(service, locale),
  );

  useEffect(() => {
    let cancelled = false;
    readPlist(service.plistPath)
      .then((doc) => {
        if (!cancelled) {
          setScheduleLines(humanizeRunSchedule(doc.entries, locale));
        }
      })
      .catch(() => {
        if (!cancelled) setScheduleLines([]);
      });
    return () => {
      cancelled = true;
    };
  }, [service.plistPath, locale]);

  const statusText = humanizeStatus(service.status, service.pid, service.lastExitStatus, locale);
  const statusColor = STATUS_COLOR_MAP[service.status];
  const programText = humanizeProgram(service.program, service.programArguments);

  return (
    <div className="rounded-lg bg-[var(--color-sidebar-bg)] p-4 flex flex-col gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        <span
          className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: statusColor, color: "white" }}
        >
          ●
        </span>
        <div>
          <div className="text-xs text-[var(--color-text-secondary)]">{t("summary.status")}</div>
          <div className="text-base font-semibold" style={{ color: statusColor }}>
            {statusText}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="w-5 h-5 shrink-0 text-center text-sm text-[var(--color-text-secondary)]">
          ⏱
        </span>
        <div>
          <div className="text-xs text-[var(--color-text-secondary)]">{t("summary.schedule")}</div>
          <div className="text-sm text-[var(--color-text-primary)]">
            {scheduleLines.length > 0 ? scheduleLines.join(" / ") : t("summary.noSchedule")}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="w-5 h-5 shrink-0 text-center text-sm text-[var(--color-text-secondary)]">
          ▶
        </span>
        <div>
          <div className="text-xs text-[var(--color-text-secondary)]">{t("summary.command")}</div>
          <div className="text-sm text-[var(--color-text-primary)] font-mono break-all">
            {programText}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceInfo({ service }: { service: Service }) {
  const { t } = useTranslation();
  const program = getServiceProgramFull(service);

  return (
    <div>
      <SummaryCard service={service} />
      <dl className="px-1">
        <InfoRow label={t("info.label")}>{service.label}</InfoRow>
        <InfoRow label={t("info.status")}>
          <StatusBadge status={service.status} showLabel />
        </InfoRow>
        {service.pid != null && <InfoRow label={t("info.pid")}>{service.pid}</InfoRow>}
        {service.lastExitStatus != null && (
          <InfoRow label={t("info.lastExitStatus")}>{service.lastExitStatus}</InfoRow>
        )}
        <InfoRow label={t("info.program")}>{program}</InfoRow>
        <InfoRow label={t("info.runAtLoad")}>
          {service.runAtLoad ? t("info.yes") : t("info.no")}
        </InfoRow>
        <InfoRow label={t("info.plistPath")}>{service.plistPath}</InfoRow>
        {service.standardOutPath && (
          <InfoRow label={t("info.stdoutPath")}>{service.standardOutPath}</InfoRow>
        )}
        {service.standardErrorPath && (
          <InfoRow label={t("info.stderrPath")}>{service.standardErrorPath}</InfoRow>
        )}
      </dl>
    </div>
  );
}
