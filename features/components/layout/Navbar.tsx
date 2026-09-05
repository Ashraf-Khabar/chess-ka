"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  BookOpen,
  Activity,
  Languages,
} from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { GITHUB_REPO_URL } from "@/features/settings/lib/settingsTypes";
import GitHubIcon from "@/features/components/icons/GitHubIcon";

export default function Navbar() {
  const pathname = usePathname();
  const { t, settings, updateSettings } = useSettings();

  return (
    <nav className="app-nav sticky top-0 z-40">
      <div className="app-nav-inner">
        <Link href="/" className="app-brand group">
          <span className="app-brand-mark" aria-hidden />
          <span className="font-display text-[1.4rem] leading-none tracking-tight sm:text-[1.65rem]">
            <span className="text-[var(--accent)] transition group-hover:brightness-110">
              Chess
            </span>
            <span className="text-[var(--ink)]"> Pro</span>
          </span>
        </Link>

        <div className="app-nav-links hidden md:flex">
          <NavLink href="/" icon={<Activity size={15} />} active={pathname === "/"}>
            {t("nav.analysis")}
          </NavLink>
          <NavLink
            href="/catalog"
            icon={<BookOpen size={15} />}
            active={pathname?.startsWith("/catalog") ?? false}
          >
            {t("nav.openings")}
          </NavLink>
          <NavLink
            href="/settings"
            icon={<Settings size={15} />}
            active={pathname?.startsWith("/settings") ?? false}
          >
            {t("nav.settings")}
          </NavLink>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() =>
              updateSettings({
                language: settings.language === "fr" ? "en" : "fr",
              })
            }
            className="app-nav-chip"
            title={t("settings.language")}
          >
            <Languages size={14} />
            {settings.language.toUpperCase()}
          </button>

          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm"
            title={t("nav.support")}
          >
            <GitHubIcon size={15} />
            GitHub
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/catalog"
            className="app-nav-icon"
            aria-label={t("nav.openings")}
          >
            <BookOpen size={18} />
          </Link>
          <Link
            href="/settings"
            className="app-nav-icon"
            aria-label={t("nav.settings")}
          >
            <Settings size={18} />
          </Link>
          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-nav-icon"
            aria-label={t("nav.support")}
          >
            <GitHubIcon size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  icon,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      data-active={active ? "true" : "false"}
      className="app-nav-link"
    >
      {icon}
      {children}
    </Link>
  );
}
