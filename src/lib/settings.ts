export type FontSize = "small" | "medium" | "large";
export type ThemePreference = "light" | "dark" | "system";

const FONT_SIZE_PX: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

function loadStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const stored = localStorage.getItem(key);
  return allowed.includes(stored as T) ? (stored as T) : fallback;
}

export function applyFontSize(size: FontSize): void {
  document.documentElement.style.fontSize = FONT_SIZE_PX[size];
}

export const loadFontSize = () =>
  loadStored<FontSize>("fontSize", ["small", "medium", "large"], "medium");
export const loadLocale = () => loadStored<"en" | "ja">("locale", ["en", "ja"], "en");
export const loadThemePreference = () =>
  loadStored<ThemePreference>("theme", ["light", "dark", "system"], "system");

export const SIDEBAR_WIDTH_MIN = 200;
export const SIDEBAR_WIDTH_MAX = 800;
const SIDEBAR_WIDTH_DEFAULT = 256;

export function clampSidebarWidth(value: number): number {
  return Math.max(SIDEBAR_WIDTH_MIN, Math.min(SIDEBAR_WIDTH_MAX, value));
}

export function loadSidebarWidth(): number {
  const stored = localStorage.getItem("sidebarWidth");
  if (stored === null) return SIDEBAR_WIDTH_DEFAULT;
  const n = Number(stored);
  if (Number.isNaN(n)) return SIDEBAR_WIDTH_DEFAULT;
  return clampSidebarWidth(n);
}
