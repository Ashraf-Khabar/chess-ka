"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";

/**
 * Mobile masthead — carries the brand where there is no sidebar.
 * Scrolls away so the sticky board can own the top of the viewport.
 */
export default function AppTopBar() {
  const { t, settings, updateSettings } = useSettings();

  return (
    <header className="app-topbar lg:hidden">
      <Link href="/" className="app-topbar-brand">
        <span className="app-topbar-word">
          Chess<em>Pro</em>
        </span>
        <span className="eyebrow">{t("desk.eyebrow")}</span>
      </Link>

      <button
        type="button"
        className="app-topbar-action"
        onClick={() =>
          updateSettings({
            language: settings.language === "fr" ? "en" : "fr",
          })
        }
        title={t("settings.language")}
      >
        <Languages size={15} />
        <span>{settings.language.toUpperCase()}</span>
      </button>
    </header>
  );
}
