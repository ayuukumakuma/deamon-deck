import { DetailPanel } from "../service-detail/DetailPanel";

export function MainContent() {
  return (
    <main className="flex-1 h-full pt-8 bg-[var(--color-main-bg)]">
      <DetailPanel />
    </main>
  );
}
