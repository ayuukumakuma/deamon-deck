import { useMemo } from "react";
import {
  categorizeService,
  getCategoryIcon,
  getCategoryLabel,
  type ServiceCategory,
} from "../../lib/categorize";
import { useTranslation } from "../../lib/i18n";
import { useAppState } from "../../store/appState";

const CATEGORIES: ServiceCategory[] = ["all", "homebrew", "apple", "custom"];

export function CategoryFilterChips() {
  const { locale } = useTranslation();
  const services = useAppState((s) => s.services);
  const categoryFilter = useAppState((s) => s.categoryFilter);
  const setCategoryFilter = useAppState((s) => s.setCategoryFilter);

  const counts = useMemo(() => {
    const result: Record<ServiceCategory, number> = {
      all: services.length,
      homebrew: 0,
      apple: 0,
      custom: 0,
    };
    for (const s of services) {
      result[categorizeService(s.label)]++;
    }
    return result;
  }, [services]);

  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 py-1.5 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = categoryFilter === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`flex-shrink-0 px-2.5 py-0.5 text-xs rounded-full border transition-colors cursor-pointer ${
              isActive
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/50"
            }`}
          >
            {getCategoryIcon(cat)} {getCategoryLabel(cat, locale)} ({counts[cat]})
          </button>
        );
      })}
    </div>
  );
}
