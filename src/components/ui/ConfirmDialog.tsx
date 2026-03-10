import type { ReactNode } from "react";
import { useEffect } from "react";
import { BTN_CLASS } from "../../lib/styles";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: "danger" | "default";
  loading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  loading = false,
  loadingLabel,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = () => onCancel();
    window.addEventListener("app:escape", handler);
    return () => window.removeEventListener("app:escape", handler);
  }, [onCancel]);

  const confirmStyle =
    variant === "danger"
      ? "bg-[var(--color-status-error)] text-white hover:enabled:opacity-80"
      : "bg-[var(--color-accent)] text-white hover:enabled:opacity-80";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40 cursor-default"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-96 rounded-lg bg-[var(--color-main-bg)] border border-[var(--color-border)] shadow-xl p-6 flex flex-col gap-4"
      >
        <h2
          id="confirm-dialog-title"
          className="text-base font-semibold text-[var(--color-text-primary)]"
        >
          {title}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
        {children}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            className={`${BTN_CLASS} border-[var(--color-border)] text-[var(--color-text-primary)] hover:enabled:bg-[var(--color-border)]`}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            className={`${BTN_CLASS} border-transparent ${confirmStyle}`}
            onClick={onConfirm}
          >
            {loading ? (loadingLabel ?? `${confirmLabel}...`) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
