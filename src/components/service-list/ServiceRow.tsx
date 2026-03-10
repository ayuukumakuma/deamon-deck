import { memo } from "react";
import { buildScheduleSummary, humanizeProgram } from "../../lib/humanize";
import { useTranslation } from "../../lib/i18n";
import type { Service } from "../../lib/types";
import { InlineActions } from "./InlineActions";
import { StatusBadge } from "./StatusBadge";

export const ServiceRow = memo(function ServiceRow({
  service,
  isSelected,
  onSelect,
}: {
  service: Service;
  isSelected: boolean;
  onSelect: (label: string | null) => void;
}) {
  const { locale } = useTranslation();
  const program = humanizeProgram(service.program, service.programArguments);
  const schedule = buildScheduleSummary(service, locale);

  const hasProgram = program !== "-";
  const hasSchedule = schedule.length > 0;
  let subText: string | null = null;
  if (hasProgram && hasSchedule) subText = `${program} · ${schedule[0]}`;
  else if (hasProgram) subText = program;
  else if (hasSchedule) subText = schedule[0];

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={`group relative w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors cursor-pointer overflow-hidden ${
        isSelected
          ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
          : "hover:bg-[var(--color-border)]/50"
      }`}
      onClick={() => onSelect(isSelected ? null : service.label)}
    >
      <StatusBadge status={service.status} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{service.label}</div>
        {subText && (
          <div className="text-xs text-[var(--color-text-secondary)] truncate">{subText}</div>
        )}
      </div>
      <InlineActions service={service} />
    </button>
  );
});
