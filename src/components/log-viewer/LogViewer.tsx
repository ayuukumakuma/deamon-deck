import { useVirtualizer } from "@tanstack/react-virtual";
import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef } from "react";
import { useLogSearch } from "../../hooks/useLogSearch";
import { useLogStream } from "../../hooks/useLogStream";
import { useTranslation } from "../../lib/i18n";
import type { LogSource, Service } from "../../lib/types";
import { LogLineComponent } from "./LogLine";

interface Props {
  service: Service;
  active: boolean;
}

const FILTER_OPTIONS: { value: LogSource | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "stdout", label: "Stdout" },
  { value: "stderr", label: "Stderr" },
  { value: "system", label: "System" },
];

const TOOLBAR_CONTROL =
  "px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

export function LogViewer({ service, active }: Props) {
  const { t } = useTranslation();
  const {
    filteredLines,
    isPaused,
    autoScroll,
    sourceFilter,
    togglePause,
    toggleAutoScroll,
    setSourceFilter,
    clear,
  } = useLogStream({ service, active });

  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    openSearch,
    closeSearch,
    caseSensitive,
    toggleCaseSensitive,
    matchIndices,
    currentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
    totalMatches,
  } = useLogSearch(filteredLines);

  const parentRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 20,
  });

  const virtualizerRef = useRef(virtualizer);
  virtualizerRef.current = virtualizer;

  useEffect(() => {
    if (autoScroll && !userScrolledRef.current && filteredLines.length > 0) {
      virtualizerRef.current.scrollToIndex(filteredLines.length - 1, { align: "end" });
    }
  }, [filteredLines.length, autoScroll]);

  // Scroll to current match
  useEffect(() => {
    if (currentMatchIndex >= 0 && matchIndices[currentMatchIndex] !== undefined) {
      virtualizerRef.current.scrollToIndex(matchIndices[currentMatchIndex], { align: "center" });
      userScrolledRef.current = false;
    }
  }, [currentMatchIndex, matchIndices]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  // Cmd+F handler
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey && e.key === "f") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, openSearch]);

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevMatch();
      } else {
        goToNextMatch();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
    }
  };

  const handleScroll = useCallback(() => {
    if (!parentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    userScrolledRef.current = !isAtBottom;
  }, []);

  const matchSet = useMemo(() => new Set(matchIndices), [matchIndices]);
  const currentMatchLineIndex = currentMatchIndex >= 0 ? matchIndices[currentMatchIndex] : -1;

  const searchRegex = useMemo(() => {
    if (!isSearchOpen || !searchQuery) return undefined;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = caseSensitive ? "g" : "gi";
    return new RegExp(`(${escaped})`, flags);
  }, [isSearchOpen, searchQuery, caseSensitive]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] flex-shrink-0">
        <button type="button" className={TOOLBAR_CONTROL} onClick={togglePause}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button type="button" className={TOOLBAR_CONTROL} onClick={clear}>
          Clear
        </button>
        <button type="button" className={TOOLBAR_CONTROL} onClick={toggleAutoScroll}>
          Auto-scroll: {autoScroll ? "On" : "Off"}
        </button>
        <select
          className={TOOLBAR_CONTROL}
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as LogSource | "all")}
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[var(--color-text-secondary)]">
          {filteredLines.length} lines
        </span>
      </div>

      {isSearchOpen && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-sidebar-bg)] flex-shrink-0">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("logSearch.placeholder")}
            className="flex-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-main-bg)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
          <span className="text-xs text-[var(--color-text-secondary)] min-w-[3rem] text-center">
            {totalMatches > 0
              ? `${currentMatchIndex + 1}/${totalMatches}`
              : t("logSearch.noMatches")}
          </span>
          <button
            type="button"
            className={TOOLBAR_CONTROL}
            onClick={goToPrevMatch}
            disabled={totalMatches === 0}
            title={t("logSearch.prev")}
          >
            ↑
          </button>
          <button
            type="button"
            className={TOOLBAR_CONTROL}
            onClick={goToNextMatch}
            disabled={totalMatches === 0}
            title={t("logSearch.next")}
          >
            ↓
          </button>
          <button
            type="button"
            className={`${TOOLBAR_CONTROL} ${caseSensitive ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : ""}`}
            onClick={toggleCaseSensitive}
            title={t("logSearch.caseSensitive")}
          >
            Aa
          </button>
          <button type="button" className={TOOLBAR_CONTROL} onClick={closeSearch}>
            ✕
          </button>
        </div>
      )}

      {filteredLines.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)] text-sm">
          {service.standardOutPath || service.standardErrorPath
            ? "Waiting for log output..."
            : "No log paths configured. Set StandardOutPath or StandardErrorPath in the plist editor."}
        </div>
      ) : (
        <div ref={parentRef} onScroll={handleScroll} className="flex-1 overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => (
              <LogLineComponent
                key={virtualItem.index}
                line={filteredLines[virtualItem.index]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                searchRegex={searchRegex}
                isMatch={isSearchOpen && matchSet.has(virtualItem.index)}
                isCurrentMatch={virtualItem.index === currentMatchLineIndex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
