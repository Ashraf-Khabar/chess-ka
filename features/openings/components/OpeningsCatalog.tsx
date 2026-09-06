"use client";

import { useMemo, useState } from "react";
import { Cpu, ListOrdered, MessageSquare, Library } from "lucide-react";
import { Chess } from "chess.js";
import InteractiveBoard from "@/features/chessboard/components/InteractiveBoard";
import { useChessGame } from "@/features/chessboard/hooks/useChessGame";
import AnalysisSheet, {
  type AnalysisSheetTab,
} from "@/features/analysis/components/AnalysisSheet";
import EnginePanel from "@/features/analysis/components/EnginePanel";
import MoveList from "@/features/analysis/components/MoveList";
import MoveCoachPanel from "@/features/analysis/components/MoveCoachPanel";
import {
  formatEvaluation,
  useStockfish,
} from "@/features/analysis/hooks/useStockfish";
import { useMoveClassification } from "@/features/analysis/hooks/useMoveClassification";
import { uciToSan } from "@/features/analysis/lib/uci";
import {
  OPENING_LINES,
  matchOpening,
  type OpeningLine,
} from "@/features/openings/lib/openingBook";
import { useMediaQuery } from "@/features/components/hooks/useMediaQuery";
import { useSettings } from "@/features/settings/context/SettingsContext";

type CatalogTab = "moves" | "coach" | "engine" | "library";

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
 * Openings catalog — pick a line, walk it on the board with book + quality marks.
 * Same desk shape as the analysis home: sticky board + sheet, or three columns.
 */
export default function OpeningsCatalog() {
  const { settings, t } = useSettings();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [selectedId, setSelectedId] = useState(OPENING_LINES[0]?.id ?? "");
  const [tab, setTab] = useState<CatalogTab>("library");

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
    { depth: settings.engineDepth, workerPath }
  );

  const sideToMove = useMemo<"w" | "b">(
    () => (game.fen.includes(" w ") ? "w" : "b"),
    [game.fen]
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

  const settledLiveBestUci = evaluation.isThinking ? null : evaluation.bestMove;

  const matched = matchOpening(game.history, game.plyIndex);
  const openingName =
    settings.language === "fr"
      ? (matched?.nameFr ?? selected?.nameFr)
      : (matched?.nameEn ?? selected?.nameEn);

  const evalLabel = formatEvaluation(
    evaluation.cp,
    evaluation.mate,
    sideToMove
  );

  const board = (
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
      bare={isDesktop === false}
      hideSizeControls={false}
    />
  );

  const moveList = (
    <MoveList
      history={game.history}
      plyIndex={game.plyIndex}
      onSelectPly={game.goToPly}
      mainLine={game.mainLine}
      forkPly={game.forkPly}
      variation={game.variation}
      isOnVariation={game.isOnVariation}
      onSelectMainPly={game.goToMainPly}
      onReturnToFork={game.returnToFork}
      currentQuality={classification.quality}
    />
  );

  const coachPanel = (
    <MoveCoachPanel
      classification={classification}
      bestMoveSan={bestMoveSan}
      suggestedBestSan={suggestedBestSan}
    />
  );

  const enginePanel = (
    <EnginePanel
      evaluation={evaluation}
      sideToMove={sideToMove}
      bestMoveSan={bestMoveSan}
      classification={classification}
      suggestedBestSan={suggestedBestSan}
    />
  );

  const lineList = (
    <div className="library-panel">
      <header className="library-head">
        <div className="min-w-0">
          <p className="eyebrow">{t("openings.eyebrow")}</p>
          <h2 className="font-display text-lg text-[var(--ink)]">
            {t("openings.title")}
          </h2>
        </div>
        <span className="chip">{OPENING_LINES.length}</span>
      </header>
      <div className="library-list">
        {OPENING_LINES.map((line) => {
          const active = line.id === selectedId;
          const label = settings.language === "fr" ? line.nameFr : line.nameEn;
          return (
            <button
              key={line.id}
              type="button"
              onClick={() => setSelectedId(line.id)}
              data-active={active ? "true" : "false"}
              className="list-row"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8125rem] font-semibold text-[var(--ink)]">
                  {label}
                </span>
                <span className="text-[0.6875rem] text-[var(--ink-faint)]">
                  {line.eco} · {line.uciMoves.length} {t("openings.plies")}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isDesktop === null) {
    return (
      <div className="desk-loading">
        <div className="desk-loading-board" aria-hidden />
      </div>
    );
  }

  if (!isDesktop) {
    const tabs: AnalysisSheetTab[] = [
      {
        id: "library",
        label: t("openings.eyebrow"),
        icon: <Library size={13} aria-hidden />,
        content: lineList,
      },
      {
        id: "moves",
        label: t("review.moves"),
        icon: <ListOrdered size={13} aria-hidden />,
        content: moveList,
      },
      ...(settings.showCoachPanel
        ? [
            {
              id: "coach",
              label: t("coach.eyebrow"),
              icon: <MessageSquare size={13} aria-hidden />,
              content: coachPanel,
            },
          ]
        : []),
      {
        id: "engine",
        label: t("engine.title"),
        icon: <Cpu size={13} aria-hidden />,
        content: enginePanel,
      },
    ];

    return (
      <div className="desk-mobile">
        <div className="desk-board-sticky">{board}</div>

        <div className="desk-strip">
          <div className="min-w-0">
            <p className="eyebrow">{t("openings.eyebrow")}</p>
            <h1 className="truncate">{openingName}</h1>
          </div>
          <span className="desk-strip-eval">{evalLabel}</span>
        </div>

        <div className="desk-mobile-body">
          <div className="flex flex-wrap items-center gap-2">
            {matched && (
              <span className="chip chip--accent">{t("openings.book")}</span>
            )}
            {selected && <span className="chip">{selected.eco}</span>}
          </div>
          <p className="text-xs leading-relaxed text-[var(--ink-faint)]">
            {t("openings.hint")}
          </p>
        </div>

        <AnalysisSheet
          tabs={tabs}
          activeTab={tab}
          onTabChange={(id) => setTab(id as CatalogTab)}
          peek={evalLabel}
        />
      </div>
    );
  }

  return (
    <div className="desk-desktop">
      <section className="desk-rail" aria-label={t("openings.title")}>
        {lineList}
        <div className="rail-block">
          <p className="text-xs leading-relaxed text-[var(--ink-faint)]">
            {t("openings.hint")}
          </p>
        </div>
      </section>

      <section className="desk-stage fade-rise">
        <div className="desk-masthead">
          <p className="eyebrow">{t("openings.eyebrow")}</p>
          <h1>{openingName}</h1>
          <div className="desk-masthead-meta">
            {matched && (
              <span className="chip chip--accent">{t("openings.book")}</span>
            )}
            {selected && <span className="chip">{selected.eco}</span>}
          </div>
        </div>

        <div className="desk-board">{board}</div>
      </section>

      <section
        className="desk-rail desk-rail--right"
        aria-label={t("engine.title")}
      >
        <div className="rail-block">
          <div className="rail-head">
            <p className="eyebrow">{t("engine.eval")}</p>
            <span className="desk-eval-hero !text-2xl">{evalLabel}</span>
          </div>
          {moveList}
        </div>
        {settings.showCoachPanel && coachPanel}
        {enginePanel}
      </section>
    </div>
  );
}
