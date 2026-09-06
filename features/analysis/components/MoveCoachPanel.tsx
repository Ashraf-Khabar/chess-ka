"use client";

import { useMemo } from "react";
import { ArrowRight, ChevronRight, Loader2, Sparkles } from "lucide-react";
import type { MoveClassification } from "@/features/analysis/hooks/useMoveClassification";
import {
  MOVE_QUALITY_LABEL,
  MOVE_QUALITY_LABEL_FR,
  type MoveQuality,
} from "@/features/analysis/lib/classifyMove";
import { explainMove } from "@/features/analysis/lib/moveFeedback";
import {
  explainWhyRight,
  explainWhyWrong,
} from "@/features/analysis/lib/moveDiagnosis";
import { isSuboptimalQuality } from "@/features/analysis/lib/boardAnnotations";
import { markerSrc } from "@/features/chessboard/lib/markerAssets";
import { useSettings } from "@/features/settings/context/SettingsContext";

interface MoveCoachPanelProps {
  classification: MoveClassification;
  bestMoveSan: string | null;
  suggestedBestSan: string | null;
  /** False = opponent ply (coach only reviews your moves). Null = free play. */
  isUserPly?: boolean | null;
  opponentName?: string | null;
}

const POSITIVE_QUALITIES = new Set<MoveQuality>([
  "brilliant",
  "great",
  "best",
  "excellent",
  "good",
]);

export default function MoveCoachPanel({
  classification,
  bestMoveSan,
  suggestedBestSan,
  isUserPly = null,
  opponentName = null,
}: MoveCoachPanelProps) {
  const { settings, t } = useSettings();

  const correctionLabel =
    suggestedBestSan ??
    (isSuboptimalQuality(classification.quality)
      ? classification.bestMoveUci
      : null);

  const coachingActive = isUserPly !== false;

  const whyWrong = useMemo(() => {
    if (
      !coachingActive ||
      classification.isClassifying ||
      !isSuboptimalQuality(classification.quality)
    ) {
      return null;
    }
    return explainWhyWrong({
      fenBefore: classification.fenBefore,
      playedSan: classification.playedSan,
      bestUci: classification.bestMoveUci,
      bestSan: correctionLabel,
      lossCp: classification.lossCp,
      language: settings.language,
    });
  }, [
    coachingActive,
    classification.bestMoveUci,
    classification.fenBefore,
    classification.isClassifying,
    classification.lossCp,
    classification.playedSan,
    classification.quality,
    correctionLabel,
    settings.language,
  ]);

  const whyRight = useMemo(() => {
    if (
      !coachingActive ||
      classification.isClassifying ||
      !classification.quality ||
      !POSITIVE_QUALITIES.has(classification.quality)
    ) {
      return null;
    }
    return explainWhyRight({
      fenBefore: classification.fenBefore,
      playedSan: classification.playedSan,
      bestUci: classification.bestMoveUci,
      language: settings.language,
      isSacrifice: classification.isSacrifice,
    });
  }, [
    coachingActive,
    classification.bestMoveUci,
    classification.fenBefore,
    classification.isClassifying,
    classification.isSacrifice,
    classification.playedSan,
    classification.quality,
    settings.language,
  ]);

  const explanation = explainMove({
    quality: classification.quality,
    playedSan: classification.playedSan,
    bestMoveSan: correctionLabel,
    fenBefore: classification.fenBefore,
    lossCp: classification.lossCp,
    isEngineBest: classification.isEngineBest,
    isSacrifice: classification.isSacrifice,
    isClassifying: classification.isClassifying,
    language: settings.language,
    isUserPly,
    opponentName,
  });

  const showCorrection =
    coachingActive &&
    isSuboptimalQuality(classification.quality) &&
    Boolean(correctionLabel);

  const qualityLabel = (quality: MoveQuality) =>
    settings.language === "fr"
      ? MOVE_QUALITY_LABEL_FR[quality]
      : MOVE_QUALITY_LABEL[quality];

  const quality = classification.quality;
  const showQualityBadge = quality != null && classification.playedSan;

  return (
    <section className="panel-shell coach-panel">
      <header className="coach-header">
        <div className="min-w-0">
          <p className="eyebrow">{t("coach.eyebrow")}</p>
          <h2 className="font-display text-xl text-[var(--ink)]">
            {t("coach.title")}
          </h2>
        </div>
        <span className="coach-header-icon" aria-hidden>
          <Sparkles size={15} />
        </span>
      </header>

      {showQualityBadge && (
        <div className="coach-move-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={markerSrc(quality)}
            alt=""
            className="coach-quality-img"
            draggable={false}
          />
          <div className="min-w-0">
            <p className="font-mono text-base font-bold text-[var(--ink)]">
              {classification.playedSan}
            </p>
            <span className={`quality-badge quality-${quality}`}>
              {qualityLabel(quality)}
              {classification.lossCp != null &&
                isSuboptimalQuality(quality) && (
                  <span className="ml-1 opacity-80">
                    −{Math.max(0, Math.round(classification.lossCp))} cp
                  </span>
                )}
            </span>
          </div>
          {!coachingActive && (
            <span className="coach-pill">{t("coach.opponent")}</span>
          )}
        </div>
      )}

      <div className="coach-body">
        {classification.isClassifying && coachingActive ? (
          <p className="coach-text inline-flex items-center gap-2">
            <Loader2 size={15} className="animate-spin text-[var(--accent)]" />
            {explanation}
          </p>
        ) : (
          <p className="coach-text">{explanation}</p>
        )}
      </div>

      {whyWrong && (
        <div className="coach-card coach-card-why">
          <p className="coach-card-label">{t("coach.why")}</p>
          <p className="coach-card-text">{whyWrong}</p>
        </div>
      )}

      {whyRight && !whyWrong && (
        <div className="coach-card coach-card-best">
          <p className="coach-card-label">{t("coach.whyRight")}</p>
          <p className="coach-card-text">{whyRight}</p>
        </div>
      )}

      {showCorrection && (
        <div className="coach-card coach-card-fix">
          <ArrowRight
            size={16}
            className="shrink-0 text-[var(--eval-blunder)]"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="coach-card-label !text-[var(--eval-blunder)]">
              {t("coach.playThis")}
            </p>
            <p className="font-mono text-lg font-bold text-[var(--ink)]">
              {correctionLabel}
            </p>
          </div>
        </div>
      )}

      {!coachingActive && (
        <div className="coach-hint">
          <ChevronRight size={14} className="shrink-0 text-[var(--accent)]" />
          <span>
            {t("coach.opponentOnly")} {t("coach.stepHint")}
          </span>
        </div>
      )}

      {coachingActive &&
        !showCorrection &&
        bestMoveSan &&
        !classification.playedSan && (
          <div className="coach-card coach-card-best">
            <div className="min-w-0">
              <p className="coach-card-label">{t("coach.bestNow")}</p>
              <p className="font-mono text-lg font-bold text-[var(--accent)]">
                {bestMoveSan}
              </p>
            </div>
          </div>
        )}
    </section>
  );
}
