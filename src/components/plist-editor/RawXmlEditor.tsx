import { xml as xmlLang } from "@codemirror/lang-xml";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { plistToXml, xmlToPlist } from "../../lib/commands";
import { useTranslation } from "../../lib/i18n";
import { BTN_CLASS, ERROR_BOX_CLASS } from "../../lib/styles";
import type { PlistDocument } from "../../lib/types";
import { useAppState } from "../../store/appState";

interface RawXmlEditorProps {
  document: PlistDocument;
  onChange: (doc: PlistDocument) => void;
}

export function RawXmlEditor({ document, onChange }: RawXmlEditorProps) {
  const resolved = useAppState((s) => s.resolvedTheme);
  const { t } = useTranslation();
  const [xmlString, setXmlString] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lineWrap, setLineWrap] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const suppressSyncRef = useRef(false);

  useEffect(() => {
    if (suppressSyncRef.current) {
      suppressSyncRef.current = false;
      return;
    }
    setLoading(true);
    plistToXml(document)
      .then((xml) => {
        setXmlString(xml);
        setParseError(null);
      })
      .catch((e) => setParseError(String(e)))
      .finally(() => setLoading(false));
  }, [document]);

  const handleChange = useCallback(
    (value: string) => {
      setXmlString(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const doc = await xmlToPlist(value);
          setParseError(null);
          suppressSyncRef.current = true;
          onChange(doc);
        } catch (e) {
          setParseError(e instanceof Error ? e.message : String(e));
        }
      }, 300);
    },
    [onChange],
  );

  const extensions = useMemo(
    () => [xmlLang(), ...(lineWrap ? [EditorView.lineWrapping] : [])],
    [lineWrap],
  );

  if (loading) {
    return (
      <div className="text-sm text-[var(--color-text-secondary)]">{t("plist.loadingXml")}</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          className={`${BTN_CLASS} text-xs ${
            lineWrap
              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
          onClick={() => setLineWrap((v) => !v)}
        >
          {t("plist.wrapLines")}
        </button>
      </div>
      <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
        <CodeMirror
          value={xmlString}
          onChange={handleChange}
          extensions={extensions}
          theme={resolved === "dark" ? "dark" : "light"}
          minHeight="200px"
          maxHeight="70vh"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
          }}
        />
      </div>
      {parseError && <div className={ERROR_BOX_CLASS}>{parseError}</div>}
    </div>
  );
}
