import { useMemo } from "react";
import type { ServiceStatus } from "../lib/types";
import { useAppState } from "../store/appState";

export function useStatusCounts(): Record<ServiceStatus, number> {
  const services = useAppState((s) => s.services);
  return useMemo(() => {
    const counts: Record<ServiceStatus, number> = {
      Running: 0,
      Stopped: 0,
      Error: 0,
      NotLoaded: 0,
    };
    for (const s of services) {
      counts[s.status]++;
    }
    return counts;
  }, [services]);
}
