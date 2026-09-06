"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { APP_NAV_ITEMS } from "@/features/components/layout/navItems";

/**
 * Mobile tab rail — underline markers, 44px targets, safe-area aware.
 * Hidden on desktop and during the immersive /analyze review.
 */
export default function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useSettings();
  const isAnalyze = Boolean(pathname?.startsWith("/analyze"));

  if (isAnalyze) return null;

  return (
    <nav className="app-tabbar lg:hidden" aria-label={t("nav.menu")}>
      <div className="app-tabbar-inner">
        {APP_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? "true" : "false"}
              className="app-tab"
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              <span className="app-tab-label">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
