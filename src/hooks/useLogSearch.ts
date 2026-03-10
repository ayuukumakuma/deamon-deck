import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LogLine } from "../lib/types";

export interface UseLogSearchReturn {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  caseSensitive: boolean;
  toggleCaseSensitive: () => void;
  matchIndices: number[];
  currentMatchIndex: number;
  goToNextMatch: () => void;
  goToPrevMatch: () => void;
  totalMatches: number;
}

export function useLogSearch(filteredLines: LogLine[]): UseLogSearchReturn {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSetSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(q), 150);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const matchIndices = useMemo(() => {
    if (!debouncedQuery) return [];
    const query = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase();
    const indices: number[] = [];
    for (let i = 0; i < filteredLines.length; i++) {
      const content = caseSensitive
        ? filteredLines[i].content
        : filteredLines[i].content.toLowerCase();
      if (content.includes(query)) {
        indices.push(i);
      }
    }
    return indices;
  }, [filteredLines, debouncedQuery, caseSensitive]);

  useEffect(() => {
    setCurrentMatchIndex(matchIndices.length > 0 ? 0 : -1);
  }, [matchIndices]);

  const goToNextMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchIndices.length);
  }, [matchIndices.length]);

  const goToPrevMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matchIndices.length) % matchIndices.length);
  }, [matchIndices.length]);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setCurrentMatchIndex(-1);
  }, []);

  const toggleCaseSensitive = useCallback(() => setCaseSensitive((prev) => !prev), []);

  return {
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    isSearchOpen,
    openSearch,
    closeSearch,
    caseSensitive,
    toggleCaseSensitive,
    matchIndices,
    currentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
    totalMatches: matchIndices.length,
  };
}
