"use client";

import Link from "next/link";
import {
  Languages,
  RotateCcw,
  Sparkles,
  Square,
  ArrowRightLeft,
  Palette,
  Type,
  Gauge,
  LayoutGrid,
} from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";
import {
  ENGINE_DEPTH_OPTIONS,
  GITHUB_REPO_URL,
  type AnimationSpeed,
  type AppLanguage,
  type AppTheme,
  type BoardSize,
  type BoardTheme,
  type FontPair,
} from "@/features/settings/lib/settingsTypes";
import GitHubIcon from "@/features/components/icons/GitHubIcon";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, t, hydrated } = useSettings();

  if (!hydrated) {
    return (
      <div className="panel-shell mx-auto max-w-4xl p-8 text-sm text-[var(--ink-muted)]">
        …
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 fade-rise">
      <header className="panel-shell">
        <p className="eyebrow">{t("settings.eyebrow")}</p>
        <h1 className="font-display text-3xl text-[var(--ink)]">
          {t("settings.title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--accent)]">{t("settings.saved")}</p>
      </header>

      <section className="panel-shell space-y-5">
        <h2 className="font-display text-xl text-[var(--ink)]">
          {t("settings.section.general")}
        </h2>

        <SettingBlock icon={<Languages size={16} />} title={t("settings.language")}>
          <Segmented
            value={settings.language}
            options={[
              { value: "fr", label: "Français" },
              { value: "en", label: "English" },
            ]}
            onChange={(language) =>
              updateSettings({ language: language as AppLanguage })
            }
          />
        </SettingBlock>

        <SettingBlock icon={<Type size={16} />} title={t("settings.font")}>
          <Segmented
            value={settings.fontPair}
            options={[
              { value: "studio", label: t("settings.font.studio") },
              { value: "manrope", label: t("settings.font.manrope") },
              { value: "grotesk", label: t("settings.font.grotesk") },
            ]}
            onChange={(fontPair) =>
              updateSettings({ fontPair: fontPair as FontPair })
            }
          />
        </SettingBlock>

        <SettingBlock icon={<Palette size={16} />} title={t("settings.appTheme")}>
          <ThemeSwatches
            value={settings.appTheme}
            onChange={(appTheme) =>
              updateSettings({ appTheme: appTheme as AppTheme })
            }
            options={[
              { value: "atelier", label: t("settings.appTheme.atelier"), swatch: "#0d7a4f" },
              { value: "ink", label: t("settings.appTheme.ink"), swatch: "#3ecf8e" },
              { value: "marble", label: t("settings.appTheme.marble"), swatch: "#0f6f7c" },
              { value: "arena", label: t("settings.appTheme.arena"), swatch: "#c4a35a" },
            ]}
          />
        </SettingBlock>
      </section>

      <section className="panel-shell space-y-5">
        <h2 className="font-display text-xl text-[var(--ink)]">
          {t("settings.section.board")}
        </h2>

        <SettingBlock icon={<Square size={16} />} title={t("settings.boardSize")}>
          <Segmented
            value={settings.boardSize}
            options={[
              { value: "sm", label: "S" },
              { value: "md", label: "M" },
              { value: "lg", label: "L" },
              { value: "xl", label: "XL" },
            ]}
            onChange={(boardSize) =>
              updateSettings({ boardSize: boardSize as BoardSize })
            }
          />
        </SettingBlock>

        <SettingBlock icon={<Sparkles size={16} />} title={t("settings.boardTheme")}>
          <ThemeSwatches
            value={settings.boardTheme}
            onChange={(boardTheme) =>
              updateSettings({ boardTheme: boardTheme as BoardTheme })
            }
            options={[
              { value: "forest", label: t("settings.theme.forest"), swatch: "#4a6b4a" },
              { value: "classic", label: t("settings.theme.classic"), swatch: "#779556" },
              { value: "walnut", label: t("settings.theme.walnut"), swatch: "#8b5a3c" },
              { value: "ice", label: t("settings.theme.ice"), swatch: "#4a6d8c" },
              { value: "midnight", label: t("settings.theme.midnight"), swatch: "#2f3b55" },
              { value: "coral", label: t("settings.theme.coral"), swatch: "#b15a4a" },
            ]}
          />
        </SettingBlock>

        <SettingBlock
          icon={<ArrowRightLeft size={16} />}
          title={t("settings.animation")}
        >
          <Segmented
            value={settings.animationSpeed}
            options={[
              { value: "fast", label: t("settings.anim.fast") },
              { value: "normal", label: t("settings.anim.normal") },
              { value: "smooth", label: t("settings.anim.smooth") },
            ]}
            onChange={(animationSpeed) =>
              updateSettings({
                animationSpeed: animationSpeed as AnimationSpeed,
              })
            }
          />
        </SettingBlock>

        <ToggleRow
          label={t("settings.liveArrow")}
          checked={settings.showLiveBestArrow}
          onChange={(showLiveBestArrow) => updateSettings({ showLiveBestArrow })}
        />
        <ToggleRow
          label={t("settings.notation")}
          checked={settings.showNotation}
          onChange={(showNotation) => updateSettings({ showNotation })}
        />
        <ToggleRow
          label={t("settings.markers")}
          checked={settings.showMoveMarkers}
          onChange={(showMoveMarkers) => updateSettings({ showMoveMarkers })}
        />
      </section>

      <section className="panel-shell space-y-5">
        <h2 className="font-display text-xl text-[var(--ink)]">
          {t("settings.section.analysis")}
        </h2>

        <SettingBlock icon={<Gauge size={16} />} title={t("settings.engineDepth")}>
          <Segmented
            value={String(settings.engineDepth)}
            options={ENGINE_DEPTH_OPTIONS.map((depth) => ({
              value: String(depth),
              label: `d${depth}`,
            }))}
            onChange={(depth) =>
              updateSettings({ engineDepth: Number.parseInt(depth, 10) })
            }
          />
        </SettingBlock>

        <ToggleRow
          label={t("settings.showCoach")}
          checked={settings.showCoachPanel}
          onChange={(showCoachPanel) => updateSettings({ showCoachPanel })}
        />

        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--ink-muted)]">
          <p className="inline-flex items-center gap-1.5 font-semibold text-[var(--ink)]">
            <LayoutGrid size={14} className="text-[var(--accent)]" />
            {t("settings.previewHint")}
          </p>
        </div>

        <button
          type="button"
          onClick={resetSettings}
          className="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm"
        >
          <RotateCcw size={14} />
          {t("settings.reset")}
        </button>
      </section>

      <section className="panel-shell">
        <p className="eyebrow">{t("settings.support")}</p>
        <h2 className="font-display text-xl text-[var(--ink)]">GitHub</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {t("settings.supportBody")}
        </p>
        <Link
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 inline-flex items-center gap-2"
        >
          <GitHubIcon size={16} />
          {t("settings.openGithub")}
        </Link>
      </section>
    </div>
  );
}

function SettingBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 border-b border-[var(--line)] pb-4 last:border-0">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
        <span className="text-[var(--accent)]">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ThemeSwatches({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string; swatch: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
              active
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--accent)]/40"
            }`}
          >
            <span
              className="h-6 w-6 shrink-0 rounded-md border border-black/20"
              style={{ backgroundColor: option.swatch }}
            />
            <span className={active ? "text-[var(--accent)]" : "text-[var(--ink)]"}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-[var(--line)] py-3 last:border-0">
      <span className="text-sm text-[var(--ink)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--line)]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[var(--surface-elevated)] shadow-sm transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}
