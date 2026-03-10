import type { MouseEvent } from "react";
import { type ActionName, useServiceAction } from "../../hooks/useServiceAction";
import { useTranslation } from "../../lib/i18n";
import type { Service, ServiceStatus } from "../../lib/types";
import { LoadIcon, PlayIcon, RestartIcon, StopIcon } from "../ui/icons";

const STATUS_ACTIONS: Record<ServiceStatus, ActionName[]> = {
  Running: ["stop", "restart"],
  Stopped: ["start"],
  Error: ["start", "stop"],
  NotLoaded: ["load"],
};

function Spinner() {
  return (
    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}

const ICON_MAP: Record<ActionName, () => JSX.Element> = {
  start: PlayIcon,
  stop: StopIcon,
  restart: RestartIcon,
  load: LoadIcon,
  unload: LoadIcon,
};

export function InlineActions({ service }: { service: Service }) {
  const { t } = useTranslation();
  const { execute, loadingAction } = useServiceAction();
  const actions = STATUS_ACTIONS[service.status];

  const handleClick = (e: MouseEvent, name: ActionName) => {
    e.stopPropagation();
    e.preventDefault();
    execute(name, service);
  };

  return (
    <div
      className="absolute right-0 top-0 bottom-0 flex items-center gap-0.5 pr-2 pl-6 opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        background: "linear-gradient(to right, transparent, var(--color-sidebar-bg) 30%)",
      }}
    >
      {actions.map((name) => {
        const Icon = ICON_MAP[name];
        const isLoading = loadingAction === name;
        return (
          <button
            key={name}
            type="button"
            title={t(`action.${name}`)}
            aria-label={t(`action.${name}`)}
            disabled={loadingAction !== null}
            className="p-1 rounded hover:bg-[var(--color-border)]/60 hover:scale-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            onClick={(e) => handleClick(e, name)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isLoading ? <Spinner /> : <Icon />}
          </button>
        );
      })}
    </div>
  );
}
