import { useEffect, useRef } from "react";
import { useTranslation } from "../../lib/i18n";
import type { FontSize } from "../../lib/settings";
import { useAppState } from "../../store/appState";

interface SettingsDialogProps {
  onClose: () => void;
}

const THEME_OPTIONS = ["light", "dark", "system"] as const;
const FONT_SIZE_OPTIONS: FontSize[] = ["small", "medium", "large"];
const LOCALE_OPTIONS = ["en", "ja"] as const;

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const { t } = useTranslation();
  const themePreference = useAppState((s) => s.themePreference);
  const setThemePreference = useAppState((s) => s.setThemePreference);
  const fontSize = useAppState((s) => s.fontSize);
  const setFontSize = useAppState((s) => s.setFontSize);
  const locale = useAppState((s) => s.locale);
  const setLocale = useAppState((s) => s.setLocale);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    window.addEventListener("app:escape", onClose);
    return () => window.removeEventListener("app:escape", onClose);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click to close
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop does not need keyboard interaction
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        className="w-96 rounded-lg bg-[var(--color-main-bg)] border border-[var(--color-border)] shadow-xl p-6 flex flex-col gap-5"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: dialog needs focus for a11y
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <h2
          id="settings-dialog-title"
          className="text-lg font-semibold text-[var(--color-text-primary)]"
        >
          {t("settings.title")}
        </h2>

        <SettingRow label={t("settings.theme")}>
          <ToggleGroup
            options={THEME_OPTIONS.map((o) => ({ value: o, label: t(`settings.${o}`) }))}
            selected={themePreference}
            onSelect={(v) => setThemePreference(v as "light" | "dark" | "system")}
          />
        </SettingRow>

        <SettingRow label={t("settings.fontSize")}>
          <ToggleGroup
            options={FONT_SIZE_OPTIONS.map((o) => ({ value: o, label: t(`settings.${o}`) }))}
            selected={fontSize}
            onSelect={(v) => setFontSize(v as FontSize)}
          />
        </SettingRow>

        <SettingRow label={t("settings.language")}>
          <ToggleGroup
            options={LOCALE_OPTIONS.map((o) => ({ value: o, label: t(`settings.${o}`) }))}
            selected={locale}
            onSelect={(v) => setLocale(v as "en" | "ja")}
          />
        </SettingRow>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
      {children}
    </div>
  );
}

function ToggleGroup({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-md border border-[var(--color-border)] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`flex-1 px-3 py-1.5 text-sm rounded cursor-pointer transition-colors ${
            selected === opt.value
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
