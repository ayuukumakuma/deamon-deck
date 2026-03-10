import { useEffect, useMemo, useRef, useState } from "react";
import { usePlistEditor } from "../../hooks/usePlistEditor";
import { type TranslateFn, useTranslation } from "../../lib/i18n";
import { BTN_CLASS, ERROR_BOX_CLASS, INPUT_CLASS } from "../../lib/styles";
import type { PlistValue, Service } from "../../lib/types";
import { PlistField, SMALL_BTN } from "./PlistField";
import { RawXmlEditor } from "./RawXmlEditor";

interface PlistEditorProps {
  service: Service;
}

interface KeyMeta {
  labelKey: string;
  category: string;
  defaultValue: PlistValue;
  required?: boolean;
  readonlyOnEdit?: boolean;
}

const KEY_META: Record<string, KeyMeta> = {
  Label: {
    labelKey: "plist.key.Label",
    category: "basic",
    defaultValue: { type: "String", value: "" },
    required: true,
    readonlyOnEdit: true,
  },
  Program: {
    labelKey: "plist.key.Program",
    category: "basic",
    defaultValue: { type: "String", value: "" },
  },
  ProgramArguments: {
    labelKey: "plist.key.ProgramArguments",
    category: "basic",
    defaultValue: { type: "Array", value: [{ type: "String", value: "" }] },
  },
  WorkingDirectory: {
    labelKey: "plist.key.WorkingDirectory",
    category: "basic",
    defaultValue: { type: "String", value: "" },
  },
  RunAtLoad: {
    labelKey: "plist.key.RunAtLoad",
    category: "schedule",
    defaultValue: { type: "Boolean", value: false },
  },
  KeepAlive: {
    labelKey: "plist.key.KeepAlive",
    category: "schedule",
    defaultValue: { type: "Boolean", value: false },
  },
  StartInterval: {
    labelKey: "plist.key.StartInterval",
    category: "schedule",
    defaultValue: { type: "Integer", value: 3600 },
  },
  StartCalendarInterval: {
    labelKey: "plist.key.StartCalendarInterval",
    category: "schedule",
    defaultValue: { type: "Dict", value: [] },
  },
  ThrottleInterval: {
    labelKey: "plist.key.ThrottleInterval",
    category: "schedule",
    defaultValue: { type: "Integer", value: 10 },
  },
  WatchPaths: {
    labelKey: "plist.key.WatchPaths",
    category: "schedule",
    defaultValue: { type: "Array", value: [] },
  },
  QueueDirectories: {
    labelKey: "plist.key.QueueDirectories",
    category: "schedule",
    defaultValue: { type: "Array", value: [] },
  },
  StandardOutPath: {
    labelKey: "plist.key.StandardOutPath",
    category: "logs",
    defaultValue: { type: "String", value: "" },
  },
  StandardErrorPath: {
    labelKey: "plist.key.StandardErrorPath",
    category: "logs",
    defaultValue: { type: "String", value: "" },
  },
  EnvironmentVariables: {
    labelKey: "plist.key.EnvironmentVariables",
    category: "environment",
    defaultValue: { type: "Dict", value: [] },
  },
};

const CATEGORIES = [
  {
    key: "basic",
    labelKey: "plist.group.basic",
    keys: ["Label", "Program", "ProgramArguments", "WorkingDirectory"],
  },
  {
    key: "schedule",
    labelKey: "plist.group.schedule",
    keys: [
      "RunAtLoad",
      "KeepAlive",
      "StartInterval",
      "StartCalendarInterval",
      "ThrottleInterval",
      "WatchPaths",
      "QueueDirectories",
    ],
  },
  { key: "logs", labelKey: "plist.group.logs", keys: ["StandardOutPath", "StandardErrorPath"] },
  { key: "environment", labelKey: "plist.group.environment", keys: ["EnvironmentVariables"] },
];

const ALL_KNOWN_KEYS = new Set(CATEGORIES.flatMap((c) => c.keys));

function CategorySection({
  title,
  subtitle,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/30 p-4">
      <button
        type="button"
        className="flex items-center gap-1.5 w-full text-left text-sm font-semibold text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-accent)]"
        onClick={onToggle}
      >
        <span className="text-xs text-[var(--color-text-secondary)]">{collapsed ? "▶" : "▼"}</span>
        {title}
        {subtitle && (
          <span className="ml-auto text-xs font-normal text-[var(--color-text-secondary)]">
            {subtitle}
          </span>
        )}
      </button>
      {!collapsed && <div className="flex flex-col mt-2">{children}</div>}
    </div>
  );
}

function CustomPropertyInput({
  existingKeys,
  onAdd,
  t,
}: {
  existingKeys: Set<string>;
  onAdd: (key: string, defaultValue: PlistValue) => void;
  t: TranslateFn;
}) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const canAdd = trimmed && !existingKeys.has(trimmed) && !ALL_KNOWN_KEYS.has(trimmed);

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(trimmed, { type: "String", value: "" });
    setQuery("");
  };

  return (
    <div className="flex gap-2 pt-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        placeholder={t("plist.addCustomProperty")}
        className={INPUT_CLASS}
      />
      <button
        type="button"
        className={`${BTN_CLASS} border-[var(--color-border)] text-[var(--color-text-secondary)] shrink-0`}
        onClick={handleAdd}
        disabled={!canAdd}
      >
        {t("plist.field.add")}
      </button>
    </div>
  );
}

export function PlistEditor({ service }: PlistEditorProps) {
  const {
    document,
    setDocument,
    loading,
    saving,
    errors,
    setErrors,
    loadError,
    isDirty,
    load,
    updateEntry,
    removeEntry,
    addEntry,
    save,
    saveAndReload,
  } = usePlistEditor();

  const { t } = useTranslation();
  const [mode, setMode] = useState<"structured" | "raw">("structured");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    load(service.plistPath);
  }, [service.plistPath, load]);

  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const entryMap = useMemo(
    () => new Map((document?.entries ?? []).map(([k, v]) => [k, v])),
    [document],
  );

  const existingKeys = useMemo(() => new Set(entryMap.keys()), [entryMap]);

  const modeTabs = useMemo<[string, string][]>(
    () => [
      ["structured", t("plist.mode.structured")],
      ["raw", t("plist.mode.raw")],
    ],
    [t],
  );

  useEffect(() => {
    const onSave = () => {
      if (isDirtyRef.current) save(service.plistPath);
    };
    const onSaveAndReload = () => {
      if (isDirtyRef.current) saveAndReload(service.label, service.plistPath);
    };
    window.addEventListener("plist:save", onSave);
    window.addEventListener("plist:save-and-reload", onSaveAndReload);
    return () => {
      window.removeEventListener("plist:save", onSave);
      window.removeEventListener("plist:save-and-reload", onSaveAndReload);
    };
  }, [save, saveAndReload, service.plistPath, service.label]);

  if (loading) {
    return <div className="text-sm text-[var(--color-text-secondary)]">{t("plist.loading")}</div>;
  }

  if (loadError) {
    return <div className={ERROR_BOX_CLASS}>{t("plist.loadError", { error: loadError })}</div>;
  }

  if (!document) return null;

  const otherEntries = document.entries.filter(([k]) => !ALL_KNOWN_KEYS.has(k));

  const handleSave = async () => {
    await save(service.plistPath);
  };

  const handleSaveAndReload = async () => {
    await saveAndReload(service.label, service.plistPath);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1">
        {modeTabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`${BTN_CLASS} ${
              mode === key
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
            onClick={() => setMode(key as "structured" | "raw")}
          >
            {label}
          </button>
        ))}
        {isDirty && (
          <span className="ml-2 text-sm text-[var(--color-status-not-loaded)] self-center">
            {t("plist.unsavedChanges")}
          </span>
        )}
      </div>

      {mode === "structured" ? (
        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => {
            const allEntries = cat.keys.map((key) => {
              const value = entryMap.get(key);
              const meta = KEY_META[key];
              return { key, meta, value: value ?? meta.defaultValue, isSet: value !== undefined };
            });
            const configuredCount = allEntries.filter((e) => e.isSet).length;

            return (
              <CategorySection
                key={cat.key}
                title={t(cat.labelKey)}
                subtitle={t("plist.configured", {
                  count: configuredCount,
                  total: allEntries.length,
                })}
                collapsed={collapsedSections.has(cat.key)}
                onToggle={() => toggleSection(cat.key)}
              >
                {allEntries.map(({ key, meta, value, isSet }) => (
                  <PlistField
                    key={key}
                    label={t(meta.labelKey)}
                    value={value}
                    onChange={(v) => updateEntry(key, v)}
                    readonly={meta.readonlyOnEdit}
                    required={meta.required}
                    isSet={isSet}
                    onToggle={
                      meta.required
                        ? undefined
                        : () => {
                            if (isSet) {
                              removeEntry(key);
                            } else {
                              addEntry(key, meta.defaultValue);
                            }
                          }
                    }
                  />
                ))}
              </CategorySection>
            );
          })}

          <CategorySection
            title={t("plist.group.other")}
            collapsed={collapsedSections.has("other")}
            onToggle={() => toggleSection("other")}
          >
            {otherEntries.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <div className="flex-1">
                  <PlistField label={key} value={value} onChange={(v) => updateEntry(key, v)} />
                </div>
                <button
                  type="button"
                  className={`${SMALL_BTN} mt-3`}
                  onClick={() => removeEntry(key)}
                >
                  {t("plist.remove")}
                </button>
              </div>
            ))}
            <CustomPropertyInput existingKeys={existingKeys} onAdd={addEntry} t={t} />
          </CategorySection>
        </div>
      ) : (
        <RawXmlEditor document={document} onChange={setDocument} />
      )}

      {errors.length > 0 && (
        <div className="flex flex-col gap-1">
          {errors.map((err) => (
            <div key={err} className={ERROR_BOX_CLASS}>
              {err}
            </div>
          ))}
          <button
            type="button"
            className="self-start text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            onClick={() => setErrors([])}
          >
            {t("plist.dismiss")}
          </button>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
        <button
          type="button"
          className={`${BTN_CLASS} border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:enabled:opacity-90`}
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? t("plist.saving") : t("plist.save")}
        </button>
        <button
          type="button"
          className={`${BTN_CLASS} border-[var(--color-border)] text-[var(--color-text-primary)] hover:enabled:bg-[var(--color-sidebar-bg)]`}
          onClick={handleSaveAndReload}
          disabled={saving || !isDirty}
        >
          {saving ? t("plist.saving") : t("plist.saveAndReload")}
        </button>
      </div>
    </div>
  );
}
