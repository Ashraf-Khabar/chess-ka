"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  formatEvaluation,
  type StockfishEvaluation,
} from "@/features/analysis/hooks/useStockfish";
import type { MoveClassification } from "@/features/analysis/hooks/useMoveClassification";
import {
  MOVE_QUALITY_LABEL,
  MOVE_QUALITY_LABEL_FR,
  type MoveQuality,
} from "@/features/analysis/lib/classifyMove";
import { useSettings } from "@/features/settings/context/SettingsContext";

interface EnginePanelProps {
  evaluation: StockfishEvaluation;
  sideToMove: "w" | "b";
  bestMoveSan: string | null;
  classification: MoveClassification;
  suggestedBestSan?: string | null;
  compact?: boolean;
}

const LEGEND = [
  "brilliant",
  "great",
  "best",
  "excellent",
  "good",
  "inaccuracy",
  "mistake",
  "miss",
  "blunder",
] as const satisfies readonly MoveQuality[];

/**
 * Engine readout: eval bar, score, best move, principal variation, quality.
 */
export default function EnginePanel({
  evaluation,
  sideToMove,
  bestMoveSan,
  classification,
  suggestedBestSan = null,
  compact = false,
}: EnginePanelProps) {
  const { settings, t } = useSettings();

  const displayScore = formatEvaluation(
    evaluation.cp,
    evaluation.mate,
    sideToMove
  );

  const whiteAdvantage = useMemo(() => {
    const perspective = sideToMove === "w" ? 1 : -1;

    if (evaluation.mate !== null) {
      return evaluation.mate * perspective > 0 ? 0.97 : 0.03;
    }

    const cp = (evaluation.cp ?? 0) * perspective;
    const normalized = 1 / (1 + Math.exp(-cp / 280));
    return Math.min(0.97, Math.max(0.03, normalized));
  }, [evaluation.cp, evaluation.mate, sideToMove]);

  const qualityLabel = (quality: MoveQuality) =>
    settings.language === "fr"
      ? MOVE_QUALITY_LABEL_FR[quality]
      : MOVE_QUALITY_LABEL[quality];

  const showCorrection =
    suggestedBestSan &&
    classification.quality &&
    classification.quality !== "best" &&
    classification.quality !== "great" &&
    classification.quality !== "brilliant";

  return (
    <section
      className={`panel-shell flex min-h-0 flex-col gap-4 ${
        compact ? "!p-3" : ""
      }`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
        <div>
          <p className="eyebrow">{t("engine.eyebrow")}</p>
          <h2 className="font-display text-xl text-[var(--ink)]">
            {t("engine.title")}
          </h2>
        </div>
        <span className="chip">
          {evaluation.isThinking ? (
            <>
              <Loader2 size={11} className="animate-spin" aria-hidden />d
              {evaluation.depth}
            </>
          ) : evaluation.isReady ? (
            <>d{evaluation.depth || "—"}</>
          ) : (
            t("engine.booting")
          )}
        </span>
      </header>

      {evaluation.error ? (
        <p className="text-sm text-[var(--eval-blunder)]">{evaluation.error}</p>
      ) : (
        <>
          <div className="flex items-stretch gap-3.5">
            <div className="eval-bar" aria-hidden>
              <div
                className="eval-bar-fill"
                style={{ height: `${whiteAdvantage * 100}%` }}
              />
              <div className="eval-bar-mid" />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <p className="eyebrow">{t("engine.eval")}</p>
                <p className="desk-eval-hero !text-4xl">{displayScore}</p>
              </div>

              <div className="border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2">
                <p className="eyebrow">{t("engine.best")}</p>
                <p className="mt-0.5 font-mono text-base font-bold text-[var(--accent)]">
                  {showCorrection
                    ? suggestedBestSan
                    : (bestMoveSan ?? evaluation.bestMove ?? "—")}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2.5">
            <p className="eyebrow mb-1.5">{t("engine.quality")}</p>
            {!classification.playedSan && !classification.isClassifying ? (
              <p className="text-xs text-[var(--ink-faint)]">
                {t("engine.playHint")}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {classification.playedSan && (
                    <span className="font-mono text-sm font-bold text-[var(--ink)]">
                      {classification.playedSan}
                    </span>
                  )}
                  {classification.isClassifying && !classification.quality ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-faint)]">
                      <Loader2 size={11} className="animate-spin" aria-hidden />
                      {t("engine.classifying")}
                    </span>
                  ) : classification.quality ? (
                    <span
                      className={`quality-badge quality-${classification.quality}`}
                    >
                      {qualityLabel(classification.quality)}
                    </span>
                  ) : null}
                </div>

                {classification.lossCp !== null && classification.quality && (
                  <p className="mt-1.5 text-[0.6875rem] text-[var(--ink-faint)]">
                    {t("engine.loss")}{" "}
                    <span className="font-mono text-[var(--ink-muted)]">
                      {Math.max(0, Math.round(classification.lossCp))} cp
                    </span>
                  </p>
                )}
              </>
            )}
          </div>

          <div>
            <p className="eyebrow mb-1.5">{t("engine.pv")}</p>
            <p className="border border-[var(--line)] bg-[var(--stage)] px-3 py-2.5 font-mono text-[0.6875rem] leading-relaxed break-all text-[var(--ink-muted)]">
              {evaluation.pv.length > 0
                ? evaluation.pv.slice(0, 10).join(" ")
                : t("engine.waitingPv")}
            </p>
          </div>

          <div className="mt-auto border-t border-[var(--line)] pt-3">
            <div className="flex flex-wrap gap-1">
              {LEGEND.map((tone) => (
                <span key={tone} className={`quality-badge quality-${tone}`}>
                  {qualityLabel(tone)}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[0.6875rem] leading-relaxed text-[var(--ink-faint)]">
              {t("engine.footer")}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
