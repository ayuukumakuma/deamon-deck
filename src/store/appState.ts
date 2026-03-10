import { create } from "zustand";
import type { ServiceCategory } from "../lib/categorize";
import type { Locale } from "../lib/i18n";
import type { FontSize, ThemePreference } from "../lib/settings";
import { loadFontSize, loadLocale, loadSidebarWidth, loadThemePreference } from "../lib/settings";
import type { Service, ServiceStatus, TabKey, Toast } from "../lib/types";

type ResolvedTheme = "light" | "dark";

interface AppState {
  services: Service[];
  selectedServiceLabel: string | null;
  activeTab: TabKey;
  filter: string;
  categoryFilter: ServiceCategory;
  statusFilter: ServiceStatus | null;
  isLoading: boolean;
  resolvedTheme: ResolvedTheme;
  themePreference: ThemePreference;
  fontSize: FontSize;
  locale: Locale;
  sidebarWidth: number;
  isSettingsOpen: boolean;
  toasts: Toast[];
  refreshServices: () => Promise<void>;
  setServices: (services: Service[]) => void;
  setSelectedServiceLabel: (label: string | null) => void;
  setActiveTab: (tab: TabKey) => void;
  setFilter: (filter: string) => void;
  setCategoryFilter: (category: ServiceCategory) => void;
  setStatusFilter: (status: ServiceStatus | null) => void;
  setIsLoading: (loading: boolean) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  setThemePreference: (pref: ThemePreference) => void;
  setFontSize: (size: FontSize) => void;
  setLocale: (locale: Locale) => void;
  setSidebarWidth: (width: number) => void;
  setIsSettingsOpen: (open: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setRefreshServices: (fn: () => Promise<void>) => void;
}

export const useAppState = create<AppState>((set, get) => ({
  services: [],
  selectedServiceLabel: null,
  activeTab: "detail",
  filter: "",
  categoryFilter: "all",
  statusFilter: null,
  isLoading: true,
  resolvedTheme: "light",
  themePreference: loadThemePreference(),
  fontSize: loadFontSize(),
  locale: loadLocale(),
  sidebarWidth: loadSidebarWidth(),
  isSettingsOpen: false,
  toasts: [],
  refreshServices: async () => {},
  setServices: (services) => set({ services }),
  setSelectedServiceLabel: (label) => {
    if (label === get().selectedServiceLabel) return;
    set({ selectedServiceLabel: label });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilter: (filter) => set({ filter }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setStatusFilter: (status) => {
    if (status === get().statusFilter) return;
    set({ statusFilter: status });
  },
  setIsLoading: (loading) => set({ isLoading: loading }),
  setResolvedTheme: (theme) => set({ resolvedTheme: theme }),
  setThemePreference: (pref) => {
    localStorage.setItem("theme", pref);
    set({ themePreference: pref });
  },
  setFontSize: (size) => {
    localStorage.setItem("fontSize", size);
    set({ fontSize: size });
  },
  setLocale: (locale) => {
    localStorage.setItem("locale", locale);
    set({ locale });
  },
  setSidebarWidth: (width) => {
    if (width === get().sidebarWidth) return;
    set({ sidebarWidth: width });
  },
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  addToast: (toast) => {
    const MAX_TOASTS = 5;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => {
      const next = [...state.toasts, { ...toast, id }];
      return { toasts: next.slice(-MAX_TOASTS) };
    });
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setRefreshServices: (fn) => set({ refreshServices: fn }),
}));
