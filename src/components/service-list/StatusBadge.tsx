import { useTranslation } from "../../lib/i18n";
import type { ServiceStatus } from "../../lib/types";

const STATUS_COLORS: Record<ServiceStatus, string> = {
  Running: "var(--color-status-running)",
  Stopped: "var(--color-status-stopped)",
  Error: "var(--color-status-error)",
  NotLoaded: "var(--color-status-not-loaded)",
};

export function StatusBadge({
  status,
  showLabel = false,
}: {
  status: ServiceStatus;
  showLabel?: boolean;
}) {
  const { t } = useTranslation();
  const label = t(`status.${status}`);

  return (
    <span role="img" className="inline-flex items-center gap-1.5" aria-label={`Status: ${label}`}>
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      />
      {showLabel && <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>}
    </span>
  );
}
