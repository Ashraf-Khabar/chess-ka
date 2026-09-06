import type { LucideIcon } from "lucide-react";
import { LayoutGrid, BookOpen, UserRound } from "lucide-react";
import type { TranslationKey } from "@/features/settings/lib/i18n";

export interface AppNavItem {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  /** Match pathname for active state */
  match: (pathname: string | null) => boolean;
}

/** Core app routes — Board / Catalog / Profile */
export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/",
    labelKey: "nav.board",
    icon: LayoutGrid,
    match: (pathname) =>
      pathname === "/" || Boolean(pathname?.startsWith("/analyze")),
  },
  {
    href: "/catalog",
    labelKey: "nav.catalog",
    icon: BookOpen,
    match: (pathname) => Boolean(pathname?.startsWith("/catalog")),
  },
  {
    href: "/settings",
    labelKey: "nav.profile",
    icon: UserRound,
    match: (pathname) => Boolean(pathname?.startsWith("/settings")),
  },
];
