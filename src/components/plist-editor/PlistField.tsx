import { type TranslateFn, useTranslation } from "../../lib/i18n";
import { getPlistKeyHelp } from "../../lib/plistHelp";
import { INPUT_CLASS } from "../../lib/styles";
import type { PlistValue } from "../../lib/types";

interface PlistFieldProps {
  label: string;
  value: PlistValue;
  onChange: (value: PlistValue) => void;
  readonly?: boolean;
  required?: boolean;
  isSet?: boolean;
  onToggle?: () => void;
}

export const SMALL_BTN =
  "px-2 py-0.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-bg)] cursor-pointer";

export function PlistField({
  label,
  value,
  onChange,
  readonly,
  required,
  isSet,
  onToggle,
}: PlistFieldProps) {
  const { t, locale } = useTranslation();
  const helpText = getPlistKeyHelp(label, locale);

  return (
    <div className="flex flex-col gap-1 py-3">
      <div className="flex items-center gap-2">
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer shrink-0 ${
              isSet ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                isSet ? "left-4" : "left-0.5"
              }`}
            />
          </button>
        )}
        <span className="text-sm text-[var(--color-text-secondary)]">
          {label}
          {required && <span className="text-[var(--color-status-error)] ml-1">*</span>}
        </span>
      </div>
      {helpText && <span className="text-xs text-[var(--color-text-secondary)]">{helpText}</span>}
      <div className={isSet === false ? "opacity-40 pointer-events-none" : ""}>
        <PlistValueInput value={value} onChange={onChange} readonly={readonly} t={t} />
      </div>
    </div>
  );
}

interface PlistValueInputProps {
  value: PlistValue;
  onChange: (value: PlistValue) => void;
  readonly?: boolean;
  t: TranslateFn;
}

function PlistValueInput({ value, onChange, readonly, t }: PlistValueInputProps) {
  switch (value.type) {
    case "String":
      return (
        <input
          type="text"
          value={value.value}
          onChange={(e) => onChange({ type: "String", value: e.target.value })}
          disabled={readonly}
          className={INPUT_CLASS}
        />
      );

    case "Integer":
      return (
        <input
          type="number"
          step="1"
          value={value.value}
          onChange={(e) => onChange({ type: "Integer", value: parseInt(e.target.value, 10) || 0 })}
          disabled={readonly}
          className={INPUT_CLASS}
        />
      );

    case "Real":
      return (
        <input
          type="number"
          value={value.value}
          onChange={(e) => onChange({ type: "Real", value: parseFloat(e.target.value) || 0 })}
          disabled={readonly}
          className={INPUT_CLASS}
        />
      );

    case "Boolean":
      return (
        <button
          type="button"
          disabled={readonly}
          onClick={() => onChange({ type: "Boolean", value: !value.value })}
          className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
            value.value ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
          } ${readonly ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              value.value ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      );

    case "Array":
      return <ArrayInput value={value.value} onChange={onChange} readonly={readonly} t={t} />;

    case "Dict":
      return <DictInput value={value.value} onChange={onChange} readonly={readonly} t={t} />;

    case "Data":
      return (
        <span className="text-sm text-[var(--color-text-secondary)] font-mono">
          {t("plist.field.dataBytes", { bytes: value.value.length })}
        </span>
      );

    case "Date":
      return (
        <input
          type="text"
          value={value.value}
          onChange={(e) => onChange({ type: "Date", value: e.target.value })}
          disabled={readonly}
          placeholder={t("plist.field.datePlaceholder")}
          className={INPUT_CLASS}
        />
      );
  }
}

interface ArrayInputProps {
  value: PlistValue[];
  onChange: (value: PlistValue) => void;
  readonly?: boolean;
  t: TranslateFn;
}

function ArrayInput({ value, onChange, readonly, t }: ArrayInputProps) {
  const updateItem = (index: number, item: PlistValue) => {
    const next = [...value];
    next[index] = item;
    onChange({ type: "Array", value: next });
  };

  const removeItem = (index: number) => {
    onChange({ type: "Array", value: value.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    onChange({ type: "Array", value: [...value, { type: "String", value: "" }] });
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ type: "Array", value: next });
  };

  return (
    <div className="flex flex-col gap-1">
      {value.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: array items have no stable identifier
        <div key={i} className="flex items-center gap-1">
          <div className="flex flex-col">
            <button
              type="button"
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer leading-none"
              onClick={() => moveItem(i, i - 1)}
              disabled={readonly || i === 0}
            >
              ▲
            </button>
            <button
              type="button"
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer leading-none"
              onClick={() => moveItem(i, i + 1)}
              disabled={readonly || i === value.length - 1}
            >
              ▼
            </button>
          </div>
          <div className="flex-1">
            <PlistValueInput
              value={item}
              onChange={(v) => updateItem(i, v)}
              readonly={readonly}
              t={t}
            />
          </div>
          {!readonly && (
            <button type="button" className={SMALL_BTN} onClick={() => removeItem(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      {!readonly && (
        <button type="button" className={`${SMALL_BTN} self-start`} onClick={addItem}>
          {t("plist.field.add")}
        </button>
      )}
    </div>
  );
}

interface DictInputProps {
  value: [string, PlistValue][];
  onChange: (value: PlistValue) => void;
  readonly?: boolean;
  t: TranslateFn;
}

function DictInput({ value, onChange, readonly, t }: DictInputProps) {
  const updateKey = (index: number, newKey: string) => {
    const next = value.map(([k, v], i): [string, PlistValue] =>
      i === index ? [newKey, v] : [k, v],
    );
    onChange({ type: "Dict", value: next });
  };

  const updateValue = (index: number, newValue: PlistValue) => {
    const next = value.map(([k, v], i): [string, PlistValue] =>
      i === index ? [k, newValue] : [k, v],
    );
    onChange({ type: "Dict", value: next });
  };

  const removeEntry = (index: number) => {
    onChange({ type: "Dict", value: value.filter((_, i) => i !== index) });
  };

  const addEntry = () => {
    onChange({ type: "Dict", value: [...value, ["", { type: "String", value: "" }]] });
  };

  return (
    <div className="flex flex-col gap-1 pl-3 border-l-2 border-[var(--color-border)]">
      {value.map(([key, val], i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: dict entries may have duplicate keys during editing
        <div key={i} className="flex items-start gap-1">
          <input
            type="text"
            value={key}
            onChange={(e) => updateKey(i, e.target.value)}
            disabled={readonly}
            placeholder={t("plist.field.key")}
            className={`${INPUT_CLASS} !w-32 shrink-0`}
          />
          <div className="flex-1">
            <PlistValueInput
              value={val}
              onChange={(v) => updateValue(i, v)}
              readonly={readonly}
              t={t}
            />
          </div>
          {!readonly && (
            <button type="button" className={`${SMALL_BTN} mt-1.5`} onClick={() => removeEntry(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      {!readonly && (
        <button type="button" className={`${SMALL_BTN} self-start`} onClick={addEntry}>
          {t("plist.field.add")}
        </button>
      )}
    </div>
  );
}
