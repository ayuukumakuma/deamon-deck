import type { Channel } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startLogStream, stopLogStream } from "../lib/commands";
import type { LogLine, LogSource, Service } from "../lib/types";

const MAX_LINES = 10_000;

interface UseLogStreamOptions {
  service: Service | null;
  active: boolean;
}

interface UseLogStreamReturn {
  isPaused: boolean;
  autoScroll: boolean;
  sourceFilter: LogSource | "all";
  filteredLines: LogLine[];
  togglePause: () => void;
  toggleAutoScroll: () => void;
  setSourceFilter: (filter: LogSource | "all") => void;
  clear: () => void;
}

function capLines(lines: LogLine[]): LogLine[] {
  return lines.length > MAX_LINES ? lines.slice(-MAX_LINES) : lines;
}

export function useLogStream({ service, active }: UseLogStreamOptions): UseLogStreamReturn {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<LogSource | "all">("all");

  const pauseBufferRef = useRef<LogLine[]>([]);
  const channelRef = useRef<Channel<LogLine> | null>(null);
  const activeLabelRef = useRef<string | null>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // RAF-batched line appending
  const pendingRef = useRef<LogLine[]>([]);
  const rafRef = useRef<number | null>(null);

  const flushPending = useCallback(() => {
    const batch = pendingRef.current;
    pendingRef.current = [];
    rafRef.current = null;
    if (batch.length > 0) {
      setLines((prev) => capLines([...prev, ...batch]));
    }
  }, []);

  useEffect(() => {
    if (!active || !service) {
      if (activeLabelRef.current) {
        stopLogStream(activeLabelRef.current).catch(console.error);
        activeLabelRef.current = null;
        channelRef.current = null;
      }
      return;
    }

    setLines([]);
    setIsPaused(false);
    pauseBufferRef.current = [];
    pendingRef.current = [];

    const { promise, channel } = startLogStream(
      service.label,
      service.standardOutPath,
      service.standardErrorPath,
      service.program ?? service.programArguments?.[0] ?? null,
      (line) => {
        if (isPausedRef.current) {
          pauseBufferRef.current.push(line);
        } else {
          pendingRef.current.push(line);
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(flushPending);
          }
        }
      },
    );

    channelRef.current = channel;
    activeLabelRef.current = service.label;
    promise.catch(console.error);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (activeLabelRef.current) {
        stopLogStream(activeLabelRef.current).catch(console.error);
        activeLabelRef.current = null;
        channelRef.current = null;
      }
    };
  }, [active, flushPending, service]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      if (prev) {
        const buffered = pauseBufferRef.current;
        pauseBufferRef.current = [];
        if (buffered.length > 0) {
          setLines((prevLines) => capLines([...prevLines, ...buffered]));
        }
      }
      return !prev;
    });
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setAutoScroll((prev) => !prev);
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    pauseBufferRef.current = [];
    pendingRef.current = [];
  }, []);

  const filteredLines = useMemo(
    () => (sourceFilter === "all" ? lines : lines.filter((l) => l.source === sourceFilter)),
    [lines, sourceFilter],
  );

  return {
    isPaused,
    autoScroll,
    sourceFilter,
    filteredLines,
    togglePause,
    toggleAutoScroll,
    setSourceFilter,
    clear,
  };
}
