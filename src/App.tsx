import { useEffect } from "react";
import { MainContent } from "./components/layout/MainContent";
import { Sidebar } from "./components/layout/Sidebar";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { ToastContainer } from "./components/ui/Toast";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useServices } from "./hooks/useServices";
import { useTheme } from "./hooks/useTheme";
import { applyFontSize } from "./lib/settings";
import { useAppState } from "./store/appState";

function App() {
  useServices();
  useTheme();
  useKeyboardShortcuts();

  const fontSize = useAppState((s) => s.fontSize);
  const isSettingsOpen = useAppState((s) => s.isSettingsOpen);
  const setIsSettingsOpen = useAppState((s) => s.setIsSettingsOpen);

  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    const onSettings = () => setIsSettingsOpen(true);
    window.addEventListener("app:settings", onSettings);
    return () => window.removeEventListener("app:settings", onSettings);
  }, [setIsSettingsOpen]);

  return (
    <div className="flex h-screen font-sans text-[var(--color-text-primary)]">
      <div data-tauri-drag-region className="fixed top-0 left-0 right-0 h-8 z-10" />
      <Sidebar />
      <MainContent />
      {isSettingsOpen && <SettingsDialog onClose={() => setIsSettingsOpen(false)} />}
      <ToastContainer />
    </div>
  );
}

export default App;
