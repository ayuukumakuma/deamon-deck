import { useMemo } from "react";
import { useTranslation } from "../../lib/i18n";
import type { TabKey } from "../../lib/types";
import { useAppState } from "../../store/appState";
import { LogViewer } from "../log-viewer/LogViewer";
import { PlistEditor } from "../plist-editor/PlistEditor";
import { ServiceActions } from "./ServiceActions";
import { ServiceInfo } from "./ServiceInfo";
import { WelcomePanel } from "./WelcomePanel";

const TAB_KEYS: readonly { key: TabKey; labelKey: string }[] = [
  { key: "detail", labelKey: "detail.info" },
  { key: "editor", labelKey: "detail.editor" },
  { key: "logs", labelKey: "detail.logs" },
];

export function DetailPanel() {
  const { t } = useTranslation();
  const services = useAppState((s) => s.services);
  const selectedServiceLabel = useAppState((s) => s.selectedServiceLabel);
  const activeTab = useAppState((s) => s.activeTab);
  const setActiveTab = useAppState((s) => s.setActiveTab);

  const selectedService = useMemo(
    () => services.find((s) => s.label === selectedServiceLabel),
    [services, selectedServiceLabel],
  );

  if (!selectedService) {
    return <WelcomePanel />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-0">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          {selectedService.label}
        </h1>
        <div role="tablist" className="flex gap-1 border-b border-[var(--color-border)]">
          {TAB_KEYS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`px-3 py-1.5 text-sm cursor-pointer transition-colors -mb-px ${
                activeTab === tab.key
                  ? "border-b-2 border-[var(--color-accent)] text-[var(--color-accent)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className={activeTab === "logs" ? "flex-1" : "flex-1 overflow-auto p-6"}>
        {activeTab === "detail" && (
          <>
            <ServiceActions service={selectedService} />
            <ServiceInfo service={selectedService} />
          </>
        )}
        {activeTab === "editor" && <PlistEditor service={selectedService} />}
        {activeTab === "logs" && <LogViewer service={selectedService} active />}
      </div>
    </div>
  );
}
