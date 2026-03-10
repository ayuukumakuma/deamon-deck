import { useEffect } from "react";
import { useAppState } from "../store/appState";

export function useTheme() {
  const themePreference = useAppState((s) => s.themePreference);
  const setResolvedTheme = useAppState((s) => s.setResolvedTheme);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const isDark = themePreference === "dark" || (themePreference === "system" && mql.matches);
      const value = isDark ? "dark" : "light";
      setResolvedTheme(value);
      document.documentElement.setAttribute("data-theme", value);
    };
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [themePreference, setResolvedTheme]);
}
