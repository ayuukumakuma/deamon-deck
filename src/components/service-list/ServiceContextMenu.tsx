import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type ActionName, ENABLED_STATUSES, useServiceAction } from "../../hooks/useServiceAction";
import { useTranslation } from "../../lib/i18n";
import type { Service, ServiceStatus } from "../../lib/types";
import { useAppState } from "../../store/appState";
import {
  CopyIcon,
  EditIcon,
  FinderIcon,
  LoadIcon,
  LogIcon,
  PlayIcon,
  RestartIcon,
  StopIcon,
  UnloadIcon,
} from "../ui/icons";

type MenuItem =
  | { type: "separator"; id: string }
  | {
      type: "item";
      labelKey: string;
      icon?: ReactNode;
      shortcut?: string;
      action: () => void;
      disabled?: boolean;
    };

function isEnabled(status: ServiceStatus, action: ActionName): boolean {
  return ENABLED_STATUSES[action].includes(status);
}

export function ServiceContextMenu({
  service,
  position,
  onClose,
}: {
  service: Service;
  position: { x: number; y: number };
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { execute } = useServiceAction();
  const setSelectedServiceLabel = useAppState((s) => s.setSelectedServiceLabel);
  const setActiveTab = useAppState((s) => s.setActiveTab);
  const addToast = useAppState((s) => s.addToast);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState(position);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(
      8,
      position.x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 8 : position.x,
    );
    const y = Math.max(
      8,
      position.y + rect.height > window.innerHeight
        ? window.innerHeight - rect.height - 8
        : position.y,
    );
    setAdjusted((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
  }, [position]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const runAction = (name: ActionName) => {
    onClose();
    execute(name, service);
  };

  const items: MenuItem[] = [
    {
      type: "item",
      labelKey: "action.start",
      icon: <PlayIcon />,
      action: () => runAction("start"),
      disabled: !isEnabled(service.status, "start"),
    },
    {
      type: "item",
      labelKey: "action.stop",
      icon: <StopIcon />,
      action: () => runAction("stop"),
      disabled: !isEnabled(service.status, "stop"),
    },
    {
      type: "item",
      labelKey: "action.restart",
      icon: <RestartIcon />,
      action: () => runAction("restart"),
      disabled: !isEnabled(service.status, "restart"),
    },
    { type: "separator", id: "sep-actions" },
    {
      type: "item",
      labelKey: "action.load",
      icon: <LoadIcon />,
      action: () => runAction("load"),
      disabled: !isEnabled(service.status, "load"),
    },
    {
      type: "item",
      labelKey: "action.unload",
      icon: <UnloadIcon />,
      action: () => runAction("unload"),
      disabled: !isEnabled(service.status, "unload"),
    },
    { type: "separator", id: "sep-load" },
    {
      type: "item",
      labelKey: "contextMenu.editPlist",
      icon: <EditIcon />,
      action: () => {
        onClose();
        setSelectedServiceLabel(service.label);
        setActiveTab("editor");
      },
    },
    {
      type: "item",
      labelKey: "contextMenu.viewLogs",
      icon: <LogIcon />,
      action: () => {
        onClose();
        setSelectedServiceLabel(service.label);
        setActiveTab("logs");
      },
    },
    { type: "separator", id: "sep-nav" },
    {
      type: "item",
      labelKey: "contextMenu.showInFinder",
      icon: <FinderIcon />,
      action: () => {
        onClose();
        revealItemInDir(service.plistPath);
      },
    },
    {
      type: "item",
      labelKey: "contextMenu.copyLabel",
      icon: <CopyIcon />,
      shortcut: "⌘C",
      action: () => {
        onClose();
        navigator.clipboard.writeText(service.label);
        addToast({ type: "success", message: t("contextMenu.copied") });
      },
    },
  ];

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay for context menu dismissal
    <div className="fixed inset-0 z-[100]" role="presentation" onClick={onClose}>
      <div
        ref={menuRef}
        role="menu"
        className="fixed z-[101] min-w-[200px] py-1 rounded-lg shadow-2xl backdrop-blur-xl bg-[var(--color-sidebar-bg)]/80 border border-[var(--color-border)]"
        style={{ left: adjusted.x, top: adjusted.y }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {items.map((item) =>
          item.type === "separator" ? (
            <div key={item.id} className="my-1 border-t border-[var(--color-border)]" />
          ) : (
            <button
              key={item.labelKey}
              type="button"
              disabled={item.disabled}
              className="w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default hover:enabled:bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] flex items-center gap-2"
              onClick={item.action}
            >
              {item.icon}
              <span className="flex-1">{t(item.labelKey)}</span>
              {item.shortcut && (
                <span className="text-xs text-[var(--color-text-secondary)]">{item.shortcut}</span>
              )}
            </button>
          ),
        )}
      </div>
    </div>,
    document.body,
  );
}
