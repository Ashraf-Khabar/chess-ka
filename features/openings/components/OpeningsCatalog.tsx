"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play } from "lucide-react";
import { Chess } from "chess.js";
import InteractiveBoard from "@/features/chessboard/components/InteractiveBoard";
import { useChessGame } from "@/features/chessboard/hooks/useChessGame";
import MoveList from "@/features/analysis/components/MoveList";
import MoveCoachPanel from "@/features/analysis/components/MoveCoachPanel";
import { useStockfish } from "@/features/analysis/hooks/useStockfish";
import { useMoveClassification } from "@/features/analysis/hooks/useMoveClassification";
import { uciToSan } from "@/features/analysis/lib/uci";
import {
  OPENING_LINES,
  matchOpening,
  type OpeningLine,
} from "@/features/openings/lib/openingBook";
import { useSettings } from "@/features/settings/context/SettingsContext";

function openingToPgn(line: OpeningLine): string {
  const game = new Chess();
  for (const uci of line.uciMoves) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;
    game.move({ from, to, ...(promotion ? { promotion } : {}) });
  }
  return game.pgn();
}

/**
 * Openings catalog: pick a line, explore on the board with book + quality symbols.
 */
export default function OpeningsCatalog() {
  const { settings, t } = useSettings();
  const [selectedId, setSelectedId] = useState(OPENING_LINES[0]?.id ?? "");
  const selected =
    OPENING_LINES.find((line) => line.id === selectedId) ?? OPENING_LINES[0];

  const pgn = useMemo(
    () => (selected ? openingToPgn(selected) : null),
    [selected]
  );

  const game = useChessGame(pgn, { startAtEnd: true });
  const workerPath = "/engines/stockfish-nnue-16-single.js";

  const evaluation = useStockfish(game.fen, {
    depth: settings.engineDepth,
    workerPath,
    uiThrottleMs: 160,
  });

  const classification = useMoveClassification(
    game.history,
    game.plyIndex,
    {
      cp: evaluation.cp,
      mate: evaluation.mate,
      isThinking: evaluation.isThinking,
      depth: evaluation.depth,
    },
    { depth: Math.max(10, settings.engineDepth - 2), workerPath }
  );

  const bestMoveSan = useMemo(
    () => uciToSan(game.fen, evaluation.bestMove),
    [evaluation.bestMove, game.fen]
  );

  const suggestedBestSan = useMemo(
    () =>
      classification.fenBefore
        ? uciToSan(classification.fenBefore, classification.bestMoveUci)
        : null,
    [classification.bestMoveUci, classification.fenBefore]
  );

  const settledLiveBestUci = evaluation.isThinking
    ? null
    : evaluation.bestMove;

  const matched = matchOpening(game.history, game.plyIndex);
  const openingName =
    settings.language === "fr"
      ? matched?.nameFr ?? selected?.nameFr
      : matched?.nameEn ?? selected?.nameEn;

  const loadOpening = (line: OpeningLine) => {
    setSelectedId(line.id);
  };

  return (
    <div className="studio-grid-3">
      <section className="panel-shell fade-rise">
        <p className="eyebrow">{t("openings.eyebrow")}</p>
        <h1 className="font-display text-2xl text-[var(--ink)]">
          {t("openings.title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {t("openings.hint")}
        </p>

        <ul className="mt-4 flex max-h-[70vh] flex-col gap-1.5 overflow-y-auto pr-1">
          {OPENING_LINES.map((line) => {
            const active = line.id === selectedId;
            const label =
              settings.language === "fr" ? line.nameFr : line.nameEn;
            return (
              <li key={line.id}>
                <button
                  type="button"
                  onClick={() => loadOpening(line)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-[var(--ink)]">
                      {label}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      {line.eco} · {line.uciMoves.length}{" "}
                      {t("openings.plies")}
                    </span>
                  </span>
                  <Play
                    size={14}
                    className={
                      active ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"
                    }
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="studio-main fade-rise">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <BookOpen size={16} className="text-[var(--accent)]" />
          <h2 className="font-display text-xl text-[var(--ink)]">
            {openingName}
          </h2>
          {matched && (
            <span className="rounded-md border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
              {t("openings.book")}
            </span>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <InteractiveBoard
            game={game}
            moveQuality={classification.quality}
            markerPly={classification.classifiedPly}
            isClassifying={classification.isClassifying}
            suggestedBestUci={
              classification.isClassifying ? null : classification.bestMoveUci
            }
            liveBestUci={settledLiveBestUci}
            showLiveBestArrow
          />
          <div className="flex flex-col gap-3">
            <p className="eyebrow">{t("studio.moves")}</p>
            <MoveList
              history={game.history}
              plyIndex={game.plyIndex}
              onSelectPly={game.goToPly}
              currentQuality={classification.quality}
            />
          </div>
        </div>
      </section>

      <section className="fade-rise fade-rise-delay">
        <MoveCoachPanel
          classification={classification}
          bestMoveSan={bestMoveSan}
          suggestedBestSan={suggestedBestSan}
        />
      </section>
    </div>
  );
}
