"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Cpu,
  ListOrdered,
  MessageSquare,
  Swords,
} from "lucide-react";
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
  CATEGORY_ORDER,
  OPENING_FAMILIES,
  OPENING_LINES,
  findVariation,
  getCategoryLabel,
  matchOpening,
  type OpeningVariation,
  type VariationKind,
} from "@/features/openings/lib/openingBook";
import { useMediaQuery } from "@/features/components/hooks/useMediaQuery";
import DeskDesktop from "@/features/components/layout/DeskDesktop";
import { useSettings } from "@/features/settings/context/SettingsContext";

type CatalogTab = "moves" | "coach" | "engine" | "book" | "ideas";

function openingToPgn(uciMoves: string[]): string {
  const game = new Chess();
  for (const uci of uciMoves) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;
    game.move({ from, to, ...(promotion ? { promotion } : {}) });
  }
  return game.pgn();
}

function kindLabel(kind: VariationKind, lang: "fr" | "en"): string {
  if (lang === "fr") {
    if (kind === "gambit") return "Gambit";
    if (kind === "main") return "Principale";
    return "Variation";
  }
  if (kind === "gambit") return "Gambit";
  if (kind === "main") return "Main";
  return "Variation";
}

/**
 * Openings catalog — families, variations, gambits, White/Black ideas.
 */
export default function OpeningsCatalog() {
  const { settings, t } = useSettings();
  const lang = settings.language;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const defaultId = OPENING_FAMILIES[0]?.variations[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultId);
  const [expandedFamily, setExpandedFamily] = useState(
    OPENING_FAMILIES[0]?.id ?? ""
  );
  const [tab, setTab] = useState<CatalogTab>("book");

  const selectedPack = findVariation(selectedId);
  const selected: OpeningVariation | null = selectedPack?.variation ?? null;
  const family = selectedPack?.family ?? null;

  const pgn = useMemo(
    () => (selected ? openingToPgn(selected.uciMoves) : null),
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
  const titleName =
    lang === "fr"
      ? (matched?.nameFr ?? selected?.nameFr ?? "")
      : (matched?.nameEn ?? selected?.nameEn ?? "");

  const evalLabel = formatEvaluation(
    evaluation.cp,
    evaluation.mate,
    sideToMove
  );

  const selectVariation = (id: string, familyId: string) => {
    setSelectedId(id);
    setExpandedFamily(familyId);
  };

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

  const ideasPanel = selected && family && (
    <div className="opening-ideas-panel">
      <div className="opening-ideas">
        <p className="eyebrow">{t("openings.ideas")}</p>
        <h3>{lang === "fr" ? selected.nameFr : selected.nameEn}</h3>
        <p className="opening-ideas-summary">
          {lang === "fr" ? selected.summaryFr : selected.summaryEn}
        </p>

        <div className="opening-idea-card opening-idea-card--white">
          <p className="opening-idea-side">
            <Swords size={12} aria-hidden />
            {t("openings.white")}
          </p>
          <p>{lang === "fr" ? selected.ideaWhiteFr : selected.ideaWhiteEn}</p>
        </div>
        <div className="opening-idea-card opening-idea-card--black">
          <p className="opening-idea-side">{t("openings.black")}</p>
          <p>{lang === "fr" ? selected.ideaBlackFr : selected.ideaBlackEn}</p>
        </div>

        <div className="opening-family-blurb">
          <p className="eyebrow">
            {lang === "fr" ? family.nameFr : family.nameEn}
          </p>
          <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
            {lang === "fr" ? family.summaryFr : family.summaryEn}
          </p>
        </div>
      </div>
    </div>
  );

  const bookList = (
    <div className="library-panel opening-catalog">
      <header className="library-head">
        <div className="min-w-0">
          <p className="eyebrow">{t("openings.eyebrow")}</p>
          <h2 className="font-display text-lg text-[var(--ink)]">
            {t("openings.title")}
          </h2>
        </div>
        <span className="chip">{OPENING_LINES.length}</span>
      </header>

      <div className="opening-catalog-scroll">
        {CATEGORY_ORDER.map((category) => {
          const families = OPENING_FAMILIES.filter(
            (f) => f.category === category
          );
          if (!families.length) return null;
          return (
            <div key={category} className="opening-cat-block">
              <p className="opening-cat-label">
                {getCategoryLabel(category, lang)}
              </p>
              {families.map((fam) => {
                const open = expandedFamily === fam.id;
                return (
                  <div key={fam.id} className="opening-family">
                    <button
                      type="button"
                      className="opening-family-toggle"
                      data-open={open ? "true" : "false"}
                      onClick={() =>
                        setExpandedFamily((prev) =>
                          prev === fam.id ? "" : fam.id
                        )
                      }
                    >
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-[0.8125rem] font-semibold text-[var(--ink)]">
                          {lang === "fr" ? fam.nameFr : fam.nameEn}
                        </span>
                        <span className="text-[0.625rem] text-[var(--ink-faint)]">
                          {fam.eco} · {fam.variations.length}{" "}
                          {t("openings.lines")}
                        </span>
                      </span>
                      <BookOpen size={14} aria-hidden />
                    </button>
                    {open && (
                      <div className="opening-var-list">
                        {fam.variations.map((v) => {
                          const active = v.id === selectedId;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => selectVariation(v.id, fam.id)}
                              data-active={active ? "true" : "false"}
                              className="opening-var-row"
                            >
                              <span className="min-w-0 flex-1 text-left">
                                <span className="block truncate text-[0.8125rem] font-semibold text-[var(--ink)]">
                                  {lang === "fr" ? v.nameFr : v.nameEn}
                                </span>
                                <span className="text-[0.625rem] text-[var(--ink-faint)]">
                                  {v.eco} · {kindLabel(v.kind, lang)} ·{" "}
                                  {v.uciMoves.length} {t("openings.plies")}
                                </span>
                              </span>
                              {v.kind === "gambit" && (
                                <span className="chip chip--accent">
                                  {kindLabel("gambit", lang)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
        id: "book",
        label: t("openings.eyebrow"),
        icon: <BookOpen size={13} aria-hidden />,
        content: bookList,
      },
      {
        id: "ideas",
        label: t("openings.ideas"),
        icon: <Swords size={13} aria-hidden />,
        content: ideasPanel,
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
            <h1 className="truncate">{titleName}</h1>
          </div>
          <span className="desk-strip-eval">{evalLabel}</span>
        </div>

        <div className="desk-mobile-body">
          <div className="flex flex-wrap items-center gap-2">
            {matched && (
              <span className="chip chip--accent">{t("openings.book")}</span>
            )}
            {selected && <span className="chip">{selected.eco}</span>}
            {selected && (
              <span className="chip">{kindLabel(selected.kind, lang)}</span>
            )}
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
    <DeskDesktop
      storageKey="cpa-desk-catalog"
      leftLabel={t("openings.title")}
      rightLabel={t("openings.ideas")}
      left={bookList}
      right={
        <>
          {ideasPanel}
          <div className="rail-block">
            <div className="rail-head">
              <p className="eyebrow">{t("engine.eval")}</p>
              <span className="desk-eval-hero !text-2xl">{evalLabel}</span>
            </div>
            {moveList}
          </div>
          {settings.showCoachPanel && coachPanel}
          {enginePanel}
        </>
      }
      center={
        <>
          <div className="desk-masthead">
            <p className="eyebrow">{t("openings.eyebrow")}</p>
            <h1>{titleName}</h1>
            <div className="desk-masthead-meta">
              {matched && (
                <span className="chip chip--accent">{t("openings.book")}</span>
              )}
              {selected && <span className="chip">{selected.eco}</span>}
              {selected && (
                <span className="chip">{kindLabel(selected.kind, lang)}</span>
              )}
            </div>
          </div>
          <div className="desk-board">{board}</div>
        </>
      }
    />
  );
}
