import { useCallback, useState } from "react";
import { type ActionName, ENABLED_STATUSES, useServiceAction } from "../../hooks/useServiceAction";
import { deleteService } from "../../lib/commands";
import { useTranslation } from "../../lib/i18n";
import type { Service } from "../../lib/types";
import { useAppState } from "../../store/appState";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const ACTION_NAMES: ActionName[] = ["start", "stop", "restart", "load", "unload"];

export function ServiceActions({ service }: { service: Service }) {
  const { t } = useTranslation();
  const { execute, loadingAction } = useServiceAction();
  const isLoading = loadingAction !== null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createBackup, setCreateBackup] = useState(true);
  const setSelectedServiceLabel = useAppState((s) => s.setSelectedServiceLabel);
  const refreshServices = useAppState((s) => s.refreshServices);
  const addToast = useAppState((s) => s.addToast);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteService(service.label, service.plistPath, createBackup);
      setSelectedServiceLabel(null);
      addToast({
        type: "success",
        message: t("toast.actionSuccess", { action: t("action.delete") }),
      });
      await refreshServices();
    } catch (err) {
      addToast({
        type: "error",
        message: t("toast.actionError", {
          action: t("action.delete"),
          error: err instanceof Error ? err.message : String(err),
        }),
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [
    service.label,
    service.plistPath,
    createBackup,
    t,
    setSelectedServiceLabel,
    refreshServices,
    addToast,
  ]);

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        {ACTION_NAMES.map((name) => {
          const enabled = ENABLED_STATUSES[name].includes(service.status);
          const isCurrent = loadingAction === name;
          const label = t(`action.${name}`);
          return (
            <button
              key={name}
              type="button"
              disabled={!enabled || isLoading}
              className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-text-primary)] hover:enabled:bg-[var(--color-accent)] hover:enabled:text-white"
              onClick={() => execute(name, service)}
            >
              {isCurrent ? `${label}...` : label}
            </button>
          );
        })}
      </div>
      <div className="border-t border-[var(--color-border)] pt-4">
        <button
          type="button"
          disabled={isLoading || deleting}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-status-error)] text-[var(--color-status-error)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[var(--color-status-error)] hover:enabled:text-white"
          onClick={() => {
            setCreateBackup(true);
            setShowDeleteConfirm(true);
          }}
        >
          {t("action.delete")}
        </button>
      </div>
      {showDeleteConfirm && (
        <ConfirmDialog
          title={t("delete.title")}
          message={t("delete.message", { label: service.label })}
          confirmLabel={t("delete.confirm")}
          cancelLabel={t("delete.cancel")}
          variant="danger"
          loading={deleting}
          loadingLabel={t("delete.deleting")}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        >
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={createBackup}
              onChange={(e) => setCreateBackup(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            {t("delete.backupOption")}
          </label>
        </ConfirmDialog>
      )}
    </>
  );
}
