import { useEffect } from "react";
import { useAppState } from "../store/appState";

const TEXT_INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const state = useAppState.getState();

      if (meta) {
        switch (e.key) {
          case "r": {
            e.preventDefault();
            state.refreshServices();
            return;
          }
          case "s": {
            if (state.activeTab === "editor" && state.selectedServiceLabel) {
              e.preventDefault();
              window.dispatchEvent(
                new CustomEvent(e.shiftKey ? "plist:save-and-reload" : "plist:save"),
              );
            }
            return;
          }
          case "n": {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("app:new-service"));
            return;
          }
          case "f": {
            e.preventDefault();
            document.querySelector<HTMLInputElement>("[data-search-input]")?.focus();
            return;
          }
          case ",": {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("app:settings"));
            return;
          }
        }
      }

      if (e.key === "Escape") {
        if (state.filter) {
          state.setFilter("");
        }
        window.dispatchEvent(new CustomEvent("app:escape"));
        return;
      }

      if (
        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
        !TEXT_INPUT_TAGS.has(document.activeElement?.tagName ?? "")
      ) {
        const services = state.services;
        const lowerFilter = state.filter.toLowerCase();
        const filtered = state.filter
          ? services.filter((s) => s.label.toLowerCase().includes(lowerFilter))
          : services;
        if (filtered.length === 0) return;

        const currentIdx = filtered.findIndex((s) => s.label === state.selectedServiceLabel);
        let nextIdx: number;
        if (e.key === "ArrowDown") {
          nextIdx = currentIdx < filtered.length - 1 ? currentIdx + 1 : 0;
        } else {
          nextIdx = currentIdx > 0 ? currentIdx - 1 : filtered.length - 1;
        }
        e.preventDefault();
        state.setSelectedServiceLabel(filtered[nextIdx].label);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
