import { useStatusCounts } from "../../hooks/useStatusCounts";
import { useTranslation } from "../../lib/i18n";
import { STATUS_CONFIG } from "../../lib/types";
import { useAppState } from "../../store/appState";

export function StatusFilterChips() {
  const { t } = useTranslation();
  const statusFilter = useAppState((s) => s.statusFilter);
  const setStatusFilter = useAppState((s) => s.setStatusFilter);
  const counts = useStatusCounts();

  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 py-1.5 scrollbar-none">
      {STATUS_CONFIG.map(({ status, colorVar }) => {
        const isActive = statusFilter === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(isActive ? null : status)}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full border transition-colors cursor-pointer ${
              isActive
                ? "text-white"
                : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/50"
            }`}
            style={
              isActive
                ? {
                    backgroundColor: `var(${colorVar})`,
                    borderColor: `var(${colorVar})`,
                  }
                : undefined
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `var(${colorVar})` }}
            />
            {t(`status.${status}`)} ({counts[status]})
          </button>
        );
      })}
    </div>
  );
}
