const ICON_CLASS = "w-3.5 h-3.5 shrink-0";

export function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className={ICON_CLASS}>
      <path d="M4 2.5v11l9-5.5z" />
    </svg>
  );
}

export function StopIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className={ICON_CLASS}>
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  );
}

export function RestartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={ICON_CLASS}
    >
      <path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v2h-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={ICON_CLASS}
    >
      <path d="M8 2v8m0 0-3-3m3 3 3-3M3 13h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UnloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={ICON_CLASS}
    >
      <path d="M8 14V6m0 0 3 3m-3-3-3 3M3 3h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={ICON_CLASS}
    >
      <path d="M11 2l3 3-8 8H3v-3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={ICON_CLASS}
    >
      <path d="M3 4h10M3 8h7M3 12h5" strokeLinecap="round" />
    </svg>
  );
}

export function FinderIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={ICON_CLASS}
    >
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M2 6h12" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={ICON_CLASS}
    >
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M11 3H4a1 1 0 0 0-1 1v7" />
    </svg>
  );
}
