import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { listServices } from "../lib/commands";
import { useAppState } from "../store/appState";

export function useServices() {
  const setServices = useAppState((s) => s.setServices);
  const setRefreshServices = useAppState((s) => s.setRefreshServices);
  const setIsLoading = useAppState((s) => s.setIsLoading);

  const refresh = useCallback(async () => {
    try {
      const result = await listServices();
      setServices(result);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setServices, setIsLoading]);

  useEffect(() => {
    setRefreshServices(refresh);
  }, [refresh, setRefreshServices]);

  useEffect(() => {
    let unlistenFn: (() => void) | null = null;
    let cancelled = false;

    refresh();
    const interval = setInterval(refresh, 5000);

    listen("services-changed", () => {
      refresh();
    }).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlistenFn = fn;
      }
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      unlistenFn?.();
    };
  }, [refresh]);
}
