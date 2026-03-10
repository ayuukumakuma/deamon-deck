import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../lib/i18n";
import { clampSidebarWidth } from "../../lib/settings";
import { INPUT_CLASS } from "../../lib/styles";
import { useAppState } from "../../store/appState";
import { CreateServiceDialog } from "../plist-editor/CreateServiceDialog";
import { ServiceTable } from "../service-list/ServiceTable";
import { CategoryFilterChips } from "./CategoryFilterChips";
import { StatusFilterChips } from "./StatusFilterChips";

export function Sidebar() {
  const { t } = useTranslation();
  const filter = useAppState((s) => s.filter);
  const setFilter = useAppState((s) => s.setFilter);
  const selectedServiceLabel = useAppState((s) => s.selectedServiceLabel);
  const setSelectedServiceLabel = useAppState((s) => s.setSelectedServiceLabel);
  const setIsSettingsOpen = useAppState((s) => s.setIsSettingsOpen);
  const sidebarWidth = useAppState((s) => s.sidebarWidth);
  const setSidebarWidth = useAppState((s) => s.setSidebarWidth);
  const [showCreate, setShowCreate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = useAppState.getState().sidebarWidth;
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      setSidebarWidth(clampSidebarWidth(startWidthRef.current + delta));
    };

    const stopDragging = () => {
      setIsDragging(false);
      const width = useAppState.getState().sidebarWidth;
      localStorage.setItem("sidebarWidth", String(width));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);
    window.addEventListener("blur", stopDragging);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("blur", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, setSidebarWidth]);

  useEffect(() => {
    const onNewService = () => setShowCreate(true);
    window.addEventListener("app:new-service", onNewService);
    return () => window.removeEventListener("app:new-service", onNewService);
  }, []);

  return (
    <aside
      className="h-full bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] flex flex-col relative"
      style={{ width: sidebarWidth, flexShrink: 0 }}
    >
      <div className="p-4 pb-2 pt-10">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            className={`text-lg font-semibold text-[var(--color-text-primary)] transition-opacity ${
              selectedServiceLabel ? "hover:opacity-70 cursor-pointer" : "cursor-default"
            }`}
            onClick={() => setSelectedServiceLabel(null)}
            title={selectedServiceLabel ? t("sidebar.homeTooltip") : undefined}
            disabled={!selectedServiceLabel}
          >
            {t("sidebar.services")}
          </button>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-main-bg)] cursor-pointer text-lg leading-none"
            onClick={() => setShowCreate(true)}
            title={t("sidebar.newService")}
          >
            +
          </button>
        </div>
        {showCreate && <CreateServiceDialog onClose={() => setShowCreate(false)} />}
        <input
          type="text"
          data-search-input
          placeholder={t("sidebar.search")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label={t("sidebar.search")}
          className={`${INPUT_CLASS} placeholder:text-[var(--color-text-secondary)]`}
        />
      </div>
      <CategoryFilterChips />
      <StatusFilterChips />
      <div className="flex-1 overflow-hidden px-2 py-1">
        <ServiceTable />
      </div>
      <div className="p-3 border-t border-[var(--color-border)]">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/50 cursor-pointer transition-colors"
          onClick={() => setIsSettingsOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label={t("sidebar.settings")}
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {t("sidebar.settings")}
        </button>
      </div>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: resize drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize z-20 hover:bg-[var(--color-border)] ${isDragging ? "bg-[var(--color-border)]" : ""}`}
      />
    </aside>
  );
}
