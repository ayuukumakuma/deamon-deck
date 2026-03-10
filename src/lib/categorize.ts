import { type Locale, translate } from "./i18n";

export type ServiceCategory = "all" | "homebrew" | "apple" | "custom";

export function categorizeService(label: string): Exclude<ServiceCategory, "all"> {
  if (label.startsWith("homebrew.mxcl.")) return "homebrew";
  if (label.startsWith("com.apple.")) return "apple";
  return "custom";
}

export function getCategoryLabel(category: ServiceCategory, locale: Locale): string {
  return translate(locale, `category.${category}`);
}

const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  all: "📋",
  homebrew: "🍺",
  apple: "🍎",
  custom: "⚙️",
};

export function getCategoryIcon(category: ServiceCategory): string {
  return CATEGORY_ICONS[category];
}
