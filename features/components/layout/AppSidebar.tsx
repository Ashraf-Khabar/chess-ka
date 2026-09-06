"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { GITHUB_REPO_URL } from "@/features/settings/lib/settingsTypes";
import { APP_NAV_ITEMS } from "@/features/components/layout/navItems";
import GitHubIcon from "@/features/components/icons/GitHubIcon";

/**
 * Desktop icon rail — symbols only, stage gets the rest of the viewport.
 */
export default function AppSidebar() {
  const pathname = usePathname();
  const { t, settings, updateSettings } = useSettings();

  return (
    <aside className="app-sidebar hidden lg:flex" aria-label={t("nav.menu")}>
      <div className="app-sidebar-inner">
        <Link
          href="/"
          className="app-sidebar-brand"
          title="Chess Pro"
          aria-label="Chess Pro"
        >
          CP
        </Link>

        <nav className="app-sidebar-nav">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            const label = t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? "true" : "false"}
                className="app-sidebar-link"
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
              >
                <Icon size={20} strokeWidth={active ? 2.35 : 1.85} aria-hidden />
              </Link>
            );
          })}
        </nav>

        <div className="app-sidebar-footer">
          <button
            type="button"
            onClick={() =>
              updateSettings({
                language: settings.language === "fr" ? "en" : "fr",
              })
            }
            className="app-sidebar-link app-sidebar-link--ghost"
            title={t("settings.language")}
            aria-label={t("settings.language")}
          >
            <Languages size={18} aria-hidden />
          </button>

          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-sidebar-link app-sidebar-link--ghost"
            title={t("nav.support")}
            aria-label={t("nav.support")}
          >
            <GitHubIcon size={18} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
