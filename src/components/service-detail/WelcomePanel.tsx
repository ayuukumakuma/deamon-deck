import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { useStatusCounts } from "../../hooks/useStatusCounts";
import { useTranslation } from "../../lib/i18n";
import { ERROR_BOX_CLASS } from "../../lib/styles";
import { STATUS_CONFIG } from "../../lib/types";
import { useAppState } from "../../store/appState";

const SHORTCUTS: { keys: string; labelKey: string }[] = [
  { keys: "Cmd+N", labelKey: "welcome.shortcut.newService" },
  { keys: "Cmd+F", labelKey: "welcome.shortcut.search" },
  { keys: "Cmd+R", labelKey: "welcome.shortcut.refresh" },
  { keys: "Up / Down", labelKey: "welcome.shortcut.navigate" },
  { keys: "Cmd+S", labelKey: "welcome.shortcut.save" },
];

export function WelcomePanel() {
  const { t } = useTranslation();
  const services = useAppState((s) => s.services);
  const statusFilter = useAppState((s) => s.statusFilter);
  const setStatusFilter = useAppState((s) => s.setStatusFilter);
  const statusCounts = useStatusCounts();

  const handleCreateService = () => {
    window.dispatchEvent(new CustomEvent("app:new-service"));
  };

  const handleOpenFolder = () => {
    const first = services[0];
    if (first) {
      revealItemInDir(first.plistPath);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t("detail.welcome")}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {t("detail.selectService")}
        </p>
      </div>

      <div className="w-full">
        <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          {t("welcome.summary")}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_CONFIG.map(({ status, colorVar }) => {
            const isActive = statusFilter === status;
            return (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(isActive ? null : status)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[var(--color-main-bg)]/80"
                    : "border-[var(--color-border)] bg-[var(--color-main-bg)] hover:bg-[var(--color-border)]/30"
                }`}
                style={
                  isActive
                    ? {
                        borderColor: `var(${colorVar})`,
                        backgroundColor: `color-mix(in srgb, var(${colorVar}) 10%, var(--color-main-bg))`,
                      }
                    : undefined
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `var(${colorVar})` }}
                />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {t(`status.${status}`)}
                </span>
                <span className="ml-auto text-sm font-medium text-[var(--color-text-primary)]">
                  {statusCounts[status]}
                </span>
              </button>
            );
          })}
        </div>
        {statusCounts.Error > 0 && (
          <div className={`${ERROR_BOX_CLASS} mt-2`}>
            {t("welcome.errorWarning", { count: statusCounts.Error })}
          </div>
        )}
      </div>

      <div className="w-full flex gap-2">
        <button
          type="button"
          onClick={handleCreateService}
          className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-pointer"
        >
          {t("welcome.createService")}
        </button>
        <button
          type="button"
          onClick={handleOpenFolder}
          disabled={services.length === 0}
          className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("welcome.openFolder")}
        </button>
      </div>

      <div className="w-full">
        <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          {t("welcome.shortcuts")}
        </h3>
        <div className="flex flex-col gap-1.5">
          {SHORTCUTS.map(({ keys, labelKey }) => (
            <div key={labelKey} className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">{t(labelKey)}</span>
              <kbd className="px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] text-[var(--color-text-secondary)] font-mono">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
