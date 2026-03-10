import { useCallback, useState } from "react";
import {
  loadService,
  restartService,
  startService,
  stopService,
  unloadService,
} from "../lib/commands";
import { useTranslation } from "../lib/i18n";
import type { Service, ServiceStatus } from "../lib/types";
import { useAppState } from "../store/appState";

export type ActionName = "start" | "stop" | "restart" | "load" | "unload";

export const ENABLED_STATUSES: Record<ActionName, ServiceStatus[]> = {
  start: ["Stopped", "Error"],
  stop: ["Running", "Error"],
  restart: ["Running", "Error"],
  load: ["NotLoaded"],
  unload: ["Running", "Stopped", "Error"],
};

const ACTION_FNS: Record<ActionName, (service: Service) => Promise<void>> = {
  start: (s) => startService(s.label),
  stop: (s) => stopService(s.label),
  restart: (s) => restartService(s.label),
  load: (s) => loadService(s.plistPath),
  unload: (s) => unloadService(s.label, s.plistPath),
};

export function useServiceAction() {
  const { t } = useTranslation();
  const refreshServices = useAppState((s) => s.refreshServices);
  const addToast = useAppState((s) => s.addToast);
  const [loadingAction, setLoadingAction] = useState<ActionName | null>(null);

  const execute = useCallback(
    async (name: ActionName, service: Service) => {
      setLoadingAction(name);
      try {
        await ACTION_FNS[name](service);
        await refreshServices();
        addToast({
          type: "success",
          message: t("toast.actionSuccess", { action: t(`action.${name}`) }),
        });
      } catch (err) {
        addToast({
          type: "error",
          message: t("toast.actionError", {
            action: t(`action.${name}`),
            error: err instanceof Error ? err.message : String(err),
          }),
        });
      } finally {
        setLoadingAction(null);
      }
    },
    [t, refreshServices, addToast],
  );

  return { execute, loadingAction };
}
