import { useVirtualizer } from "@tanstack/react-virtual";
import { type MouseEvent, useCallback, useMemo, useRef, useState } from "react";
import { categorizeService } from "../../lib/categorize";
import { useTranslation } from "../../lib/i18n";
import type { Service } from "../../lib/types";
import { useAppState } from "../../store/appState";
import { ServiceContextMenu } from "./ServiceContextMenu";
import { ServiceRow } from "./ServiceRow";

const SKELETON_WIDTHS = ["w-3/4", "w-2/3", "w-4/5", "w-1/2"] as const;
const ROW_HEIGHT = 44;

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-0.5">
      {SKELETON_WIDTHS.map((w) => (
        <div key={w} className="px-3 py-2 rounded-md animate-pulse flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
          <div className="flex-1 space-y-1.5">
            <div className={`h-3.5 bg-[var(--color-border)] rounded ${w}`} />
            <div className="h-3 bg-[var(--color-border)] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServiceTable() {
  const { t } = useTranslation();
  const services = useAppState((s) => s.services);
  const filter = useAppState((s) => s.filter);
  const categoryFilter = useAppState((s) => s.categoryFilter);
  const statusFilter = useAppState((s) => s.statusFilter);
  const isLoading = useAppState((s) => s.isLoading);
  const selectedServiceLabel = useAppState((s) => s.selectedServiceLabel);
  const setSelectedServiceLabel = useAppState((s) => s.setSelectedServiceLabel);
  const parentRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ service: Service; x: number; y: number } | null>(
    null,
  );

  const filtered = useMemo(() => {
    let result = services;
    if (categoryFilter !== "all") {
      result = result.filter((s) => categorizeService(s.label) === categoryFilter);
    }
    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter((s) => s.label.toLowerCase().includes(lowerFilter));
    }
    return result;
  }, [services, filter, categoryFilter, statusFilter]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const handleContextMenu = useCallback((e: MouseEvent, service: Service) => {
    e.preventDefault();
    setContextMenu({ service, x: e.clientX, y: e.clientY });
  }, []);

  if (isLoading && services.length === 0) {
    return <SkeletonRows />;
  }

  const hasActiveFilter = !!filter || categoryFilter !== "all" || !!statusFilter;

  if (filtered.length === 0) {
    return (
      <div className="px-3 py-4 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {hasActiveFilter ? t("sidebar.noMatch") : t("sidebar.noServices")}
        </p>
        {!hasActiveFilter && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t("sidebar.createHint")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        role="listbox"
        aria-label={t("sidebar.services")}
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const service = filtered[virtualRow.index];
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: contextmenu event for right-click menu
            <div
              key={service.label}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onContextMenu={(e) => handleContextMenu(e, service)}
            >
              <ServiceRow
                service={service}
                isSelected={selectedServiceLabel === service.label}
                onSelect={setSelectedServiceLabel}
              />
            </div>
          );
        })}
      </div>
      {contextMenu && (
        <ServiceContextMenu
          service={contextMenu.service}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
