import { useCallback, useState } from "react";
import { loadService, readPlist, unloadService, validatePlist, writePlist } from "../lib/commands";
import type { PlistDocument, PlistValue } from "../lib/types";
import { useAppState } from "../store/appState";

export function usePlistEditor() {
  const [document, setDocument] = useState<PlistDocument | null>(null);
  const [original, setOriginal] = useState<PlistDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const refreshServices = useAppState((s) => s.refreshServices);

  const isDirty = document !== null && JSON.stringify(document) !== JSON.stringify(original);

  const load = useCallback(async (path: string) => {
    setLoading(true);
    setLoadError(null);
    setErrors([]);
    try {
      const doc = await readPlist(path);
      setDocument(doc);
      setOriginal(doc);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
      setDocument(null);
      setOriginal(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntry = useCallback((key: string, value: PlistValue) => {
    setDocument((prev) => {
      if (!prev) return prev;
      const exists = prev.entries.some(([k]) => k === key);
      const entries: [string, PlistValue][] = exists
        ? prev.entries.map(([k, v]) => (k === key ? [k, value] : [k, v]))
        : [...prev.entries, [key, value]];
      return { entries };
    });
  }, []);

  const removeEntry = useCallback((key: string) => {
    setDocument((prev) => {
      if (!prev) return prev;
      return { entries: prev.entries.filter(([k]) => k !== key) };
    });
  }, []);

  const addEntry = useCallback((key: string, value: PlistValue) => {
    setDocument((prev) => {
      if (!prev) return prev;
      return { entries: [...prev.entries, [key, value]] };
    });
  }, []);

  const save = useCallback(
    async (path: string) => {
      if (!document) return false;
      setSaving(true);
      setErrors([]);
      try {
        const validationErrors = await validatePlist(document);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return false;
        }
        await writePlist(path, document);
        setOriginal(document);
        return true;
      } catch (e) {
        setErrors([e instanceof Error ? e.message : String(e)]);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [document],
  );

  const saveAndReload = useCallback(
    async (label: string, path: string) => {
      const saved = await save(path);
      if (!saved) return false;
      try {
        await unloadService(label, path);
      } catch {
        // May fail if not loaded, continue
      }
      try {
        await loadService(path);
      } catch (e) {
        setErrors([`Reload failed: ${e instanceof Error ? e.message : String(e)}`]);
        return false;
      }
      await refreshServices();
      return true;
    },
    [save, refreshServices],
  );

  return {
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
  };
}
