"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { GITHUB_REPO_URL } from "@/features/settings/lib/settingsTypes";
import { APP_NAV_ITEMS } from "@/features/components/layout/navItems";
import GitHubIcon from "@/features/components/icons/GitHubIcon";

/**
 * Desktop sidebar navigation — Linear/Vercel-inspired glass rail.
 */
export default function AppSidebar() {
  const pathname = usePathname();
  const { t, settings, updateSettings } = useSettings();

  return (
    <aside className="app-sidebar hidden md:flex" aria-label={t("nav.menu")}>
      <div className="app-sidebar-inner">
        <Link href="/" className="app-sidebar-brand group">
          <span className="app-sidebar-mark" aria-hidden>
            CPA
          </span>
          <span className="app-sidebar-title">
            Chess<span className="text-[var(--accent)]">Pro</span>
          </span>
        </Link>

        <nav className="app-sidebar-nav">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? "true" : "false"}
                className="app-sidebar-link"
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
                <span>{t(item.labelKey)}</span>
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
          >
            <Languages size={18} />
            <span>{settings.language.toUpperCase()}</span>
          </button>

          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-sidebar-link app-sidebar-link--ghost"
            title={t("nav.support")}
          >
            <GitHubIcon size={18} />
            <span>GitHub</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
