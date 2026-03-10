import type { LogLine as LogLineType } from "../../lib/types";

const SOURCE_COLORS: Record<LogLineType["source"], string> = {
  stdout: "text-[var(--color-text-primary)]",
  stderr: "text-red-400",
  system: "text-[var(--color-text-secondary)] italic",
};

interface Props {
  line: LogLineType;
  style: React.CSSProperties;
  searchRegex?: RegExp;
  isMatch?: boolean;
  isCurrentMatch?: boolean;
}

function highlightText(text: string, regex: RegExp, isCurrent: boolean) {
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  const markClass = isCurrent
    ? "bg-amber-400 text-black rounded-sm"
    : "bg-amber-200/50 dark:bg-amber-400/30 rounded-sm";
  return (
    <>
      {parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: split parts have stable indices for a given query
            <mark key={idx} className={markClass}>
              {part}
            </mark>
          );
        }
        return part;
      })}
    </>
  );
}

export function LogLineComponent({
  line,
  style,
  searchRegex,
  isMatch = false,
  isCurrentMatch = false,
}: Props) {
  let bgClass = "";
  if (isCurrentMatch) {
    bgClass = "bg-amber-400/20";
  } else if (isMatch) {
    bgClass = "bg-amber-200/10";
  }

  return (
    <div
      style={style}
      className={`flex gap-2 px-3 py-0.5 font-mono text-xs leading-5 ${SOURCE_COLORS[line.source]} ${bgClass}`}
    >
      {line.timestamp && (
        <span className="text-[var(--color-text-secondary)] flex-shrink-0 select-none opacity-60">
          {line.timestamp}
        </span>
      )}
      <span className="whitespace-pre-wrap break-all">
        {searchRegex && isMatch
          ? highlightText(line.content, searchRegex, isCurrentMatch)
          : line.content}
      </span>
    </div>
  );
}
