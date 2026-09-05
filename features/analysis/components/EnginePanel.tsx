"use client";

import { useMemo } from "react";
import { Loader2, Sparkles, Target, Gem } from "lucide-react";
import {
  formatEvaluation,
  type StockfishEvaluation,
} from "@/features/analysis/hooks/useStockfish";
import type { MoveClassification } from "@/features/analysis/hooks/useMoveClassification";
import {
  MOVE_QUALITY_LABEL_FR,
  type MoveQuality,
} from "@/features/analysis/lib/classifyMove";

interface EnginePanelProps {
  evaluation: StockfishEvaluation;
  sideToMove: "w" | "b";
  bestMoveSan: string | null;
  classification: MoveClassification;
  suggestedBestSan?: string | null;
  compact?: boolean;
}

/**
 * Right-hand engine panel: eval bar, score, best move, PV, and move quality.
 */
export default function EnginePanel({
  evaluation,
  sideToMove,
  bestMoveSan,
  classification,
  suggestedBestSan = null,
  compact = false,
}: EnginePanelProps) {
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

  return (
    <aside
      className={`panel-shell flex flex-col ${
        compact ? "min-h-0 !p-3" : "h-full min-h-[420px]"
      }`}
    >
      <header className="mb-5 flex items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <p className="eyebrow">Moteur local</p>
          <h2 className="font-display text-2xl text-[var(--ink)]">Stockfish</h2>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--ink-muted)]">
          {evaluation.isThinking ? (
            <span className="inline-flex items-center gap-1.5 text-[var(--accent)]">
              <Loader2 size={12} className="animate-spin" />
              d{evaluation.depth}
            </span>
          ) : evaluation.isReady ? (
            <span>depth {evaluation.depth || "—"}</span>
          ) : (
            <span>démarrage…</span>
          )}
        </div>
      </header>

      {evaluation.error ? (
        <p className="text-sm text-red-400">{evaluation.error}</p>
      ) : (
        <>
          <div className="mb-6 flex items-stretch gap-4">
            <EvalBar whiteRatio={whiteAdvantage} />
            <div className="flex flex-1 flex-col justify-center gap-3">
              <div>
                <p className="eyebrow">Évaluation</p>
                <p className="font-display text-4xl tracking-tight text-[var(--ink)]">
                  {displayScore}
                </p>
              </div>

              <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2.5">
                <p className="eyebrow mb-1 inline-flex items-center gap-1">
                  <Target size={12} /> Meilleur coup
                </p>
                <p className="font-mono text-lg font-semibold text-[var(--accent)]">
                  {suggestedBestSan &&
                  classification.quality &&
                  classification.quality !== "best" &&
                  classification.quality !== "great" &&
                  classification.quality !== "brilliant"
                    ? suggestedBestSan
                    : (bestMoveSan ?? evaluation.bestMove ?? "—")}
                </p>
              </div>
            </div>
          </div>

          <MoveQualityCard classification={classification} />

          <div className="mb-4">
            <p className="eyebrow mb-2 inline-flex items-center gap-1">
              <Sparkles size={12} /> Variante principale
            </p>
            <p className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-3 font-mono text-xs leading-relaxed text-[var(--ink-muted)] break-all">
              {evaluation.pv.length > 0
                ? evaluation.pv.slice(0, 10).join(" ")
                : "En attente de la ligne moteur…"}
            </p>
          </div>

          <div className="mt-auto space-y-2 border-t border-[var(--line)] pt-4">
            <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
              Stockfish tourne en local (WebAssembly). Les pastilles colorées sur
              l’échiquier reprennent le style Chess.com.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(
                [
                  "brilliant",
                  "great",
                  "best",
                  "excellent",
                  "good",
                  "inaccuracy",
                  "mistake",
                  "miss",
                  "blunder",
                ] as const satisfies readonly MoveQuality[]
              ).map((tone) => (
                <Badge key={tone} tone={tone}>
                  {MOVE_QUALITY_LABEL_FR[tone]}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function MoveQualityCard({
  classification,
}: {
  classification: MoveClassification;
}) {
  if (!classification.playedSan && !classification.isClassifying) {
    return (
      <div className="mb-5 rounded-lg border border-dashed border-[var(--line)] px-3 py-3 text-sm text-[var(--ink-muted)]">
        Jouez ou naviguez vers un coup pour le classer.
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3">
      <p className="eyebrow mb-2 inline-flex items-center gap-1">
        <Gem size={12} /> Qualité du coup
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {classification.playedSan && (
          <span className="font-mono text-base font-semibold text-[var(--ink)]">
            {classification.playedSan}
          </span>
        )}

        {classification.isClassifying && !classification.quality ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
            <Loader2 size={12} className="animate-spin" />
            Classification…
          </span>
        ) : classification.quality ? (
          <span className={`quality-badge quality-${classification.quality}`}>
            {MOVE_QUALITY_LABEL_FR[classification.quality]}
          </span>
        ) : null}
      </div>

      {classification.lossCp !== null && classification.quality && (
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          Perte{" "}
          <span className="font-mono text-[var(--ink)]">
            {Math.max(0, Math.round(classification.lossCp))} cp
          </span>
          {classification.isEngineBest ? " · meilleur moteur" : ""}
          {classification.isSacrifice ? " · sacrifice" : ""}
        </p>
      )}
    </div>
  );
}

function EvalBar({ whiteRatio }: { whiteRatio: number }) {
  return (
    <div
      className="eval-bar relative w-7 overflow-hidden rounded-full border border-[var(--line)]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#0b0d0c]" />
      <div
        className="absolute bottom-0 left-0 right-0 bg-[#e8eee4] transition-[height] duration-500 ease-out"
        style={{ height: `${whiteRatio * 100}%` }}
      />
      <div className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-[var(--accent)]/40" />
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: MoveQuality;
}) {
  return <span className={`quality-badge quality-${tone}`}>{children}</span>;
}
