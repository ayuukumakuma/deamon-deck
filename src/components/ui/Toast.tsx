import { useCallback, useEffect, useRef, useState } from "react";
import type { Toast } from "../../lib/types";
import { useAppState } from "../../store/appState";

const DEFAULT_DURATION = 3000;
const EXIT_ANIMATION_MS = 200;

const TOAST_STYLES: Record<Toast["type"], { bg: string; icon: string }> = {
  success: {
    bg: "bg-emerald-600",
    icon: "✓",
  },
  error: {
    bg: "bg-red-600",
    icon: "✕",
  },
  warning: {
    bg: "bg-amber-500",
    icon: "!",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useAppState((s) => s.removeToast);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startExit = useCallback(() => {
    setExiting(true);
    exitTimer.current = setTimeout(() => removeToast(toast.id), EXIT_ANIMATION_MS);
  }, [removeToast, toast.id]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (toast.type === "error") return;
    const duration = toast.duration ?? DEFAULT_DURATION;
    const timer = setTimeout(startExit, duration);
    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer.current);
    };
  }, [toast, startExit]);

  const style = TOAST_STYLES[toast.type];
  const active = visible && !exiting;

  return (
    <div
      className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-[400px] transition-all duration-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      role="alert"
    >
      <span className="text-base font-bold shrink-0 w-5 h-5 flex items-center justify-center">
        {style.icon}
      </span>
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={startExit}
        className="shrink-0 opacity-70 hover:opacity-100 text-sm cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useAppState((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
