"use client";

import Link from "next/link";
import {
  Languages,
  RotateCcw,
  Sparkles,
  Square,
  ArrowRightLeft,
  Palette,
  Gauge,
  LayoutGrid,
  Crown,
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
  type PieceStyle,
} from "@/features/settings/lib/settingsTypes";
import { BOARD_THEME_OPTIONS } from "@/features/chessboard/lib/boardThemes";
import { PIECE_STYLE_OPTIONS } from "@/features/chessboard/lib/pieceSets";
import GitHubIcon from "@/features/components/icons/GitHubIcon";
import type { TranslationKey } from "@/features/settings/lib/i18n";

const APP_THEME_CARDS: {
  value: AppTheme;
  swatch: string;
  mode: "light" | "dark";
}[] = [
  { value: "signal", swatch: "#c62828", mode: "light" },
  { value: "paper", swatch: "#2563eb", mode: "light" },
  { value: "emerald", swatch: "#0f8a5a", mode: "light" },
  { value: "slate", swatch: "#e67e22", mode: "light" },
  { value: "harbor", swatch: "#0e7490", mode: "light" },
  { value: "carbon", swatch: "#ef5350", mode: "dark" },
  { value: "night", swatch: "#34d399", mode: "dark" },
  { value: "dusk", swatch: "#ff7a59", mode: "dark" },
];

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
    <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-5 fade-rise">
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

        <SettingBlock icon={<Palette size={16} />} title={t("settings.appTheme")}>
          <p className="mb-2 text-xs text-[var(--ink-muted)]">
            {t("settings.appTheme.hint")}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {APP_THEME_CARDS.map((theme) => {
              const active = settings.appTheme === theme.value;
              return (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => updateSettings({ appTheme: theme.value })}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <span
                    className="mt-0.5 h-8 w-8 shrink-0 rounded-md border border-black/15"
                    style={{ backgroundColor: theme.swatch }}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          active ? "text-[var(--accent)]" : "text-[var(--ink)]"
                        }`}
                      >
                        {t(
                          `settings.appTheme.${theme.value}` as TranslationKey
                        )}
                      </span>
                      <span className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
                        {theme.mode === "light"
                          ? t("settings.mode.light")
                          : t("settings.mode.dark")}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-[var(--ink-muted)]">
                      {t(
                        `settings.appTheme.${theme.value}.desc` as TranslationKey
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
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
          <p className="mb-2 text-xs text-[var(--ink-muted)]">
            {t("settings.boardTheme.hint")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BOARD_THEME_OPTIONS.map((option) => {
              const active = settings.boardTheme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updateSettings({ boardTheme: option.value as BoardTheme })
                  }
                  className={`rounded-lg border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <span className="mb-1.5 flex h-7 overflow-hidden rounded border border-black/10">
                    <span
                      className="w-1/2"
                      style={{ backgroundColor: option.swatchLight }}
                    />
                    <span
                      className="w-1/2"
                      style={{ backgroundColor: option.swatchDark }}
                    />
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      active ? "text-[var(--accent)]" : "text-[var(--ink)]"
                    }`}
                  >
                    {t(`settings.theme.${option.value}` as TranslationKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingBlock>

        <SettingBlock icon={<Crown size={16} />} title={t("settings.pieceStyle")}>
          <p className="mb-2 text-xs text-[var(--ink-muted)]">
            {t("settings.pieceStyle.hint")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PIECE_STYLE_OPTIONS.map((option) => {
              const active = settings.pieceStyle === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updateSettings({ pieceStyle: option.value as PieceStyle })
                  }
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <span className="font-serif text-xl text-[var(--ink)]">
                    {option.preview}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        active ? "text-[var(--accent)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {t(`settings.piece.${option.value}` as TranslationKey)}
                    </span>
                    <span className="block text-[11px] text-[var(--ink-muted)]">
                      {t(
                        `settings.piece.${option.value}.desc` as TranslationKey
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
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
          <p className="mb-2 text-xs text-[var(--ink-muted)]">
            {t("settings.engineDepth.hint")}
          </p>
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
    <div className="relative z-10 flex flex-wrap gap-1.5">
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
    <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[var(--line)] py-3 last:border-0">
      <span className="text-sm text-[var(--ink)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--line)]"
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[var(--surface-elevated)] shadow-sm transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
