import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPlist, loadService } from "../../lib/commands";
import { useTranslation } from "../../lib/i18n";
import { BTN_CLASS, ERROR_BOX_CLASS, INPUT_CLASS } from "../../lib/styles";
import type { PlistDocument, PlistValue } from "../../lib/types";
import { useAppState } from "../../store/appState";

interface CreateServiceDialogProps {
  onClose: () => void;
}

export function CreateServiceDialog({ onClose }: CreateServiceDialogProps) {
  const { t } = useTranslation();
  const [label, setLabel] = useState("");
  const [program, setProgram] = useState("");
  const [runAtLoad, setRunAtLoad] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelId = useId();
  const programId = useId();

  const refreshServices = useAppState((s) => s.refreshServices);
  const setSelectedServiceLabel = useAppState((s) => s.setSelectedServiceLabel);
  const setActiveTab = useAppState((s) => s.setActiveTab);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const suggestedLabel = useMemo(() => {
    if (label.trim()) return null;
    const parts = program.trim().split(/\s+/);
    const programPath = parts[0];
    if (!programPath?.includes("/")) return null;
    const basename = programPath
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "");
    return basename ? `com.user.${basename}` : null;
  }, [label, program]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.addEventListener("app:escape", onClose);
    return () => window.removeEventListener("app:escape", onClose);
  }, [onClose]);

  const handleCreate = async () => {
    if (!label.trim()) {
      setError(t("create.labelRequired"));
      return;
    }
    if (!program.trim()) {
      setError(t("create.programRequired"));
      return;
    }

    setCreating(true);
    setError(null);

    const entries: [string, PlistValue][] = [
      ["Label", { type: "String", value: label.trim() }],
      [
        "ProgramArguments",
        {
          type: "Array",
          value: program
            .trim()
            .split(/\s+/)
            .map((s) => ({ type: "String" as const, value: s })),
        },
      ],
      ["RunAtLoad", { type: "Boolean", value: runAtLoad }],
    ];

    const doc: PlistDocument = { entries };

    try {
      const path = await createPlist(doc);
      await loadService(path);
      await refreshServices();
      setSelectedServiceLabel(label.trim());
      setActiveTab("editor");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click to close
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop does not need keyboard interaction
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-dialog-title"
        className="w-96 rounded-lg bg-[var(--color-main-bg)] border border-[var(--color-border)] shadow-xl p-6 flex flex-col gap-4"
      >
        <h2
          id="create-dialog-title"
          className="text-lg font-semibold text-[var(--color-text-primary)]"
        >
          {t("create.title")}
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor={labelId}
              className="block text-sm text-[var(--color-text-secondary)] mb-1"
            >
              {t("create.label")} <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              ref={firstInputRef}
              id={labelId}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("create.labelPlaceholder")}
              className={INPUT_CLASS}
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t("create.labelHelp")}
            </p>
            {suggestedLabel && (
              <button
                type="button"
                className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer mt-0.5 text-left"
                onClick={() => setLabel(suggestedLabel)}
              >
                {t("create.labelSuggestion", { suggestion: suggestedLabel })}
              </button>
            )}
          </div>

          <div>
            <label
              htmlFor={programId}
              className="block text-sm text-[var(--color-text-secondary)] mb-1"
            >
              {t("create.program")} <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              id={programId}
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder={t("create.programPlaceholder")}
              className={INPUT_CLASS}
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t("create.programHelp")} — {t("create.programExample")}
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={runAtLoad}
              onChange={(e) => setRunAtLoad(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            <span className="text-sm text-[var(--color-text-primary)]">
              {t("create.runAtLoad")}
            </span>
          </label>
        </div>

        {error && <div className={ERROR_BOX_CLASS}>{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className={`${BTN_CLASS} border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]`}
            onClick={onClose}
            disabled={creating}
          >
            {t("create.cancel")}
          </button>
          <button
            type="button"
            className={`${BTN_CLASS} border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:enabled:opacity-90`}
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? t("create.creating") : t("create.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
