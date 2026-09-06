"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightLeft,
  Crown,
  Gauge,
  Languages,
  Palette,
  RotateCcw,
  Sparkles,
  Square,
} from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";
import {
  APP_THEMES,
  DARK_APP_THEMES,
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

/** Two-tone swatch per theme: page ground + accent. */
const THEME_SWATCH: Record<AppTheme, [string, string]> = {
  tournament: ["#0d0c0a", "#c8974f"],
  precision: ["#090b0f", "#3fd0bd"],
  atelier: ["#ebe5da", "#8e2020"],
};

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, t, hydrated } = useSettings();

  if (!hydrated) {
    return (
      <div className="page">
        <div className="panel-shell text-sm text-[var(--ink-faint)]">…</div>
      </div>
    );
  }

  return (
    <div className="page fade-rise flex flex-col gap-4">
      <header>
        <p className="eyebrow">{t("settings.eyebrow")}</p>
        <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
          {t("settings.title")}
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          {t("settings.saved")}
        </p>
      </header>

      <section className="settings-section">
        <header>
          <h2>{t("settings.section.general")}</h2>
          <span className="eyebrow">01</span>
        </header>

        <Row icon={<Languages size={15} />} title={t("settings.language")}>
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
        </Row>

        <Row
          icon={<Palette size={15} />}
          title={t("settings.appTheme")}
          hint={t("settings.appTheme.hint")}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {APP_THEMES.map((theme) => {
              const active = settings.appTheme === theme;
              const [ground, accent] = THEME_SWATCH[theme];
              return (
                <button
                  key={theme}
                  type="button"
                  data-active={active ? "true" : "false"}
                  onClick={() => updateSettings({ appTheme: theme })}
                  className="pick-card"
                >
                  <span className="pick-swatch" aria-hidden>
                    <span style={{ backgroundColor: ground }} />
                    <span style={{ backgroundColor: accent }} />
                    <span style={{ backgroundColor: accent, opacity: 0.35 }} />
                    <span style={{ backgroundColor: ground }} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-sm font-bold ${
                          active
                            ? "text-[var(--accent)]"
                            : "text-[var(--ink)]"
                        }`}
                      >
                        {t(`settings.appTheme.${theme}` as TranslationKey)}
                      </span>
                      <span className="chip">
                        {DARK_APP_THEMES.has(theme)
                          ? t("settings.mode.dark")
                          : t("settings.mode.light")}
                      </span>
                    </span>
                    <span className="mt-1 block text-[0.6875rem] leading-snug text-[var(--ink-faint)]">
                      {t(`settings.appTheme.${theme}.desc` as TranslationKey)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Row>
      </section>

      <section className="settings-section">
        <header>
          <h2>{t("settings.section.board")}</h2>
          <span className="eyebrow">02</span>
        </header>

        <Row icon={<Square size={15} />} title={t("settings.boardSize")}>
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
        </Row>

        <Row
          icon={<Sparkles size={15} />}
          title={t("settings.boardTheme")}
          hint={t("settings.boardTheme.hint")}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BOARD_THEME_OPTIONS.map((option) => {
              const active = settings.boardTheme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  data-active={active ? "true" : "false"}
                  onClick={() =>
                    updateSettings({ boardTheme: option.value as BoardTheme })
                  }
                  className="pick-card !flex-col !gap-2"
                >
                  <span
                    className="flex h-7 w-full border border-black/15"
                    aria-hidden
                  >
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
                    className={`text-xs font-bold ${
                      active ? "text-[var(--accent)]" : "text-[var(--ink)]"
                    }`}
                  >
                    {t(`settings.theme.${option.value}` as TranslationKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </Row>

        <Row
          icon={<Crown size={15} />}
          title={t("settings.pieceStyle")}
          hint={t("settings.pieceStyle.hint")}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PIECE_STYLE_OPTIONS.map((option) => {
              const active = settings.pieceStyle === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  data-active={active ? "true" : "false"}
                  onClick={() =>
                    updateSettings({ pieceStyle: option.value as PieceStyle })
                  }
                  className="pick-card"
                >
                  <span className="font-serif text-2xl leading-none text-[var(--ink)]">
                    {option.preview}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-bold ${
                        active ? "text-[var(--accent)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {t(`settings.piece.${option.value}` as TranslationKey)}
                    </span>
                    <span className="block text-[0.6875rem] text-[var(--ink-faint)]">
                      {t(
                        `settings.piece.${option.value}.desc` as TranslationKey
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Row>

        <Row icon={<ArrowRightLeft size={15} />} title={t("settings.animation")}>
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
        </Row>

        <Toggle
          label={t("settings.liveArrow")}
          checked={settings.showLiveBestArrow}
          onChange={(showLiveBestArrow) => updateSettings({ showLiveBestArrow })}
        />
        <Toggle
          label={t("settings.notation")}
          checked={settings.showNotation}
          onChange={(showNotation) => updateSettings({ showNotation })}
        />
        <Toggle
          label={t("settings.markers")}
          checked={settings.showMoveMarkers}
          onChange={(showMoveMarkers) => updateSettings({ showMoveMarkers })}
        />
      </section>

      <section className="settings-section">
        <header>
          <h2>{t("settings.section.analysis")}</h2>
          <span className="eyebrow">03</span>
        </header>

        <Row
          icon={<Gauge size={15} />}
          title={t("settings.engineDepth")}
          hint={t("settings.engineDepth.hint")}
        >
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
        </Row>

        <Toggle
          label={t("settings.showCoach")}
          checked={settings.showCoachPanel}
          onChange={(showCoachPanel) => updateSettings({ showCoachPanel })}
        />

        <div className="settings-row flex flex-col gap-3">
          <p className="text-[0.6875rem] leading-relaxed text-[var(--ink-faint)]">
            {t("settings.previewHint")}
          </p>
          <button type="button" onClick={resetSettings} className="btn-ghost">
            <RotateCcw size={14} aria-hidden />
            {t("settings.reset")}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <header>
          <h2>{t("settings.support")}</h2>
          <span className="eyebrow">04</span>
        </header>
        <div className="settings-row flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
            {t("settings.supportBody")}
          </p>
          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary self-start"
          >
            <GitHubIcon size={15} />
            {t("settings.openGithub")}
          </Link>
        </div>
      </section>
    </div>
  );
}

function Row({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="settings-row">
      <p className="settings-row-head">
        <span className="text-[var(--accent)]">{icon}</span>
        {title}
      </p>
      {hint && (
        <p className="mt-1 mb-3 text-[0.6875rem] leading-snug text-[var(--ink-faint)]">
          {hint}
        </p>
      )}
      <div className={hint ? "" : "mt-3"}>{children}</div>
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
    <div className="seg">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-active={option.value === value ? "true" : "false"}
          onClick={() => onChange(option.value)}
          className="seg-item"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="settings-toggle"
    >
      <span className="text-sm text-[var(--ink)]">{label}</span>
      <span className="switch" data-checked={checked ? "true" : "false"} aria-hidden>
        <span className="switch-knob" />
      </span>
    </button>
  );
}
