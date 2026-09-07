"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  ListOrdered,
  Loader2,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
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
  formatGameEndDate,
  getGameResultLabel,
} from "@/features/analysis/api/chessCom";
import {
  findGameInLibrary,
  getGameId,
  loadActiveGame,
  type ActiveGameSession,
} from "@/features/analysis/lib/gameSession";
import {
  getOpponentName,
  getPerspectiveColor,
  isPerspectivePly,
} from "@/features/analysis/lib/perspective";
import { useMediaQuery } from "@/features/components/hooks/useMediaQuery";
import { useSettings } from "@/features/settings/context/SettingsContext";
import type { ChessComGame } from "@/features/analysis/api/chessCom";

interface GameReviewPageProps {
  gameId: string;
}

type ReviewTab = "moves" | "coach" | "engine";

/**
 * Game review — full-bleed sticky board plus sheet on mobile,
 * dual pane on desktop. Exactly one board mounts on either layout.
 */
export default function GameReviewPage({ gameId }: GameReviewPageProps) {
  const { t, settings } = useSettings();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [session, setSession] = useState<ActiveGameSession | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<ReviewTab>("coach");
  const [sideOpen, setSideOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cpa-desk-review:side");
      if (raw !== null) setSideOpen(raw === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSide = () => {
    setSideOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cpa-desk-review:side", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  useEffect(() => {
    const active = loadActiveGame();
    if (active && getGameId(active.game) === gameId) {
      setSession(active);
      setReady(true);
      return;
    }
    setSession(findGameInLibrary(gameId));
    setReady(true);
  }, [gameId]);

  const game = useChessGame(session?.game.pgn ?? null);
  const workerPath = "/engines/stockfish-nnue-16-single.js";

  const perspectiveColor = useMemo(
    () => (session ? getPerspectiveColor(session.username, session.game) : null),
    [session]
  );

  const isUserPly = useMemo(() => {
    if (!perspectiveColor) return null;
    if (game.plyIndex < 0 || game.history.length === 0) return null;
    return isPerspectivePly(game.history, game.plyIndex, perspectiveColor);
  }, [game.history, game.plyIndex, perspectiveColor]);

  const opponentName = useMemo(
    () => (session ? getOpponentName(session.username, session.game) : null),
    [session]
  );

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
      isUserPly !== false && classification.fenBefore
        ? uciToSan(classification.fenBefore, classification.bestMoveUci)
        : null,
    [classification.bestMoveUci, classification.fenBefore, isUserPly]
  );

  const settledLiveBestUci = evaluation.isThinking ? null : evaluation.bestMove;

  const accuracyHint = useMemo(() => {
    if (
      isUserPly === false ||
      !classification.quality ||
      classification.lossCp === null
    ) {
      return "—";
    }
    const loss = Math.max(0, classification.lossCp);
    return `${Math.max(0, Math.round(100 - loss / 3))}%`;
  }, [classification.lossCp, classification.quality, isUserPly]);

  if (!ready || isDesktop === null) {
    return (
      <div className="desk-loading">
        <span className="inline-flex items-center gap-2 text-xs">
          <Loader2 className="animate-spin" size={16} aria-hidden />
          {t("review.loading")}
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page">
        <div className="panel-shell mx-auto max-w-lg text-center">
          <p className="text-sm text-[var(--ink-muted)]">{t("review.missing")}</p>
          <Link href="/" className="btn-primary mt-4">
            <ArrowLeft size={15} aria-hidden />
            {t("review.back")}
          </Link>
        </div>
      </div>
    );
  }

  const { game: chessGame, username } = session;
  const result = getGameResultLabel(chessGame, username);
  const resultLabel =
    result === "Won"
      ? t("library.win")
      : result === "Lost"
        ? t("library.loss")
        : t("library.draw");

  const userIsBlack = perspectiveColor === "b";
  const bottomPlayer = userIsBlack ? chessGame.black : chessGame.white;
  const topPlayer = userIsBlack ? chessGame.white : chessGame.black;
  const bottomColor: "w" | "b" = userIsBlack ? "b" : "w";
  const topColor: "w" | "b" = userIsBlack ? "w" : "b";

  const evalLabel = formatEvaluation(
    evaluation.cp,
    evaluation.mate,
    sideToMove
  );

  const movesPanel = (
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
      compact
    />
  );

  const coachPanel = settings.showCoachPanel ? (
    <MoveCoachPanel
      classification={classification}
      bestMoveSan={bestMoveSan}
      suggestedBestSan={suggestedBestSan}
      isUserPly={isUserPly}
      opponentName={opponentName}
    />
  ) : (
    <p className="text-sm text-[var(--ink-faint)]">{t("settings.showCoach")}</p>
  );

  const enginePanel = (
    <EnginePanel
      evaluation={evaluation}
      sideToMove={sideToMove}
      bestMoveSan={bestMoveSan}
      classification={classification}
      suggestedBestSan={isUserPly !== false ? suggestedBestSan : null}
      compact
    />
  );

  const board = (
    <InteractiveBoard
      game={game}
      moveQuality={classification.quality}
      markerPly={classification.classifiedPly}
      isClassifying={classification.isClassifying}
      suggestedBestUci={
        isUserPly !== false && !classification.isClassifying
          ? classification.bestMoveUci
          : null
      }
      liveBestUci={settledLiveBestUci}
      showLiveBestArrow
      hideSizeControls={false}
      fillContainer={isDesktop}
      bare={!isDesktop}
      initialOrientation={userIsBlack ? "black" : "white"}
      topBanner={
        <PlayerBar
          player={topPlayer}
          color={topColor}
          active={sideToMove === topColor}
        />
      }
      bottomBanner={
        <PlayerBar
          player={bottomPlayer}
          color={bottomColor}
          active={sideToMove === bottomColor}
          highlight
        />
      }
    />
  );

  if (!isDesktop) {
    const tabs: AnalysisSheetTab[] = [
      {
        id: "moves",
        label: t("review.moves"),
        icon: <ListOrdered size={13} aria-hidden />,
        content: movesPanel,
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
      <div className="review-shell">
        <header className="review-topbar">
          <Link
            href="/"
            className="review-topbar-back"
            aria-label={t("review.back")}
          >
            <ArrowLeft size={18} aria-hidden />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-semibold text-[var(--ink)]">
              {chessGame.white.username} vs {chessGame.black.username}
            </p>
            <p className="truncate text-[0.625rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              {chessGame.time_class} · {resultLabel}
            </p>
          </div>
          <div className="shrink-0 pr-1 text-right">
            <p className="eyebrow">{t("review.accuracy")}</p>
            <p className="font-display text-base leading-none text-[var(--accent)]">
              {accuracyHint}
            </p>
          </div>
        </header>

        <div className="desk-mobile desk-mobile--immersive">
          <div className="desk-board-sticky">{board}</div>

          <div className="desk-strip">
            <div className="min-w-0">
              <p className="eyebrow">{t("review.result")}</p>
              <h2 className="truncate">{resultLabel}</h2>
            </div>
            <span className="desk-strip-eval">{evalLabel}</span>
          </div>

          <div className="desk-mobile-body">
            <dl className="grid grid-cols-2 gap-px bg-[var(--line)]">
              <div className="stat-tile !border-0">
                <dt>{t("review.players")}</dt>
                <dd className="text-sm text-[var(--ink)] tabular-nums">
                  {chessGame.white.rating}/{chessGame.black.rating}
                </dd>
              </div>
              <div className="stat-tile !border-0">
                <dt>{t("review.accuracy")}</dt>
                <dd className="font-display text-lg text-[var(--accent)]">
                  {accuracyHint}
                </dd>
              </div>
            </dl>
            <p className="text-[0.6875rem] text-[var(--ink-faint)]">
              {chessGame.rated ? t("review.rated") : t("review.casual")} ·{" "}
              <span suppressHydrationWarning>
                {formatGameEndDate(chessGame.end_time)}
              </span>
            </p>
          </div>

          <AnalysisSheet
            tabs={tabs}
            activeTab={tab}
            onTabChange={(id) => setTab(id as ReviewTab)}
            peek={evalLabel}
            immersive
          />
        </div>
      </div>
    );
  }

  return (
    <div className="review-shell">
      <header className="review-head">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link href="/" className="btn-ghost" aria-label={t("review.back")}>
            <ArrowLeft size={14} aria-hidden />
            <span>{t("review.back")}</span>
          </Link>
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-[var(--ink)]">
              {chessGame.white.username}
              <span className="mx-1.5 text-sm font-normal text-[var(--ink-faint)]">
                vs
              </span>
              {chessGame.black.username}
            </p>
            <p className="truncate text-[0.625rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              {chessGame.time_class} ·{" "}
              {chessGame.rated ? t("review.rated") : t("review.casual")} ·{" "}
              <span suppressHydrationWarning>
                {formatGameEndDate(chessGame.end_time)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-5">
          <div className="text-right">
            <p className="eyebrow">{t("review.accuracy")}</p>
            <p className="desk-eval-hero !text-3xl !text-[var(--accent)]">
              {accuracyHint}
            </p>
          </div>
          <div className="text-right">
            <p className="eyebrow">{t("review.result")}</p>
            <p className="font-display text-lg text-[var(--ink)]">
              {resultLabel}
            </p>
            <p className="text-[0.6875rem] text-[var(--ink-faint)] tabular-nums">
              {chessGame.white.rating}/{chessGame.black.rating}
            </p>
          </div>
        </div>
      </header>

      <div
        className="review-desktop"
        data-side={sideOpen ? "open" : "closed"}
      >
        <section className="review-desktop-board">{board}</section>

        <aside
          className="review-desktop-side"
          data-collapsed={sideOpen ? "false" : "true"}
        >
          <button
            type="button"
            className="review-side-toggle"
            onClick={toggleSide}
            aria-expanded={sideOpen}
            title={sideOpen ? t("engine.title") : t("engine.title")}
            aria-label={sideOpen ? "Réduire le panneau" : "Ouvrir le panneau"}
          >
            {sideOpen ? (
              <PanelRightClose size={18} aria-hidden />
            ) : (
              <PanelRightOpen size={18} aria-hidden />
            )}
          </button>
          <div className="review-side-body">
            <div className="review-tabs" role="tablist">
              <TabButton
                active={tab === "moves"}
                onClick={() => setTab("moves")}
                icon={<ListOrdered size={13} aria-hidden />}
                label={t("review.moves")}
              />
              {settings.showCoachPanel && (
                <TabButton
                  active={tab === "coach"}
                  onClick={() => setTab("coach")}
                  icon={<MessageSquare size={13} aria-hidden />}
                  label={t("coach.eyebrow")}
                />
              )}
              <TabButton
                active={tab === "engine"}
                onClick={() => setTab("engine")}
                icon={<Cpu size={13} aria-hidden />}
                label={t("engine.title")}
              />
            </div>

            <div className="review-tab-panel" role="tabpanel">
              {tab === "moves" && (
                <div className="flex h-full min-h-0 flex-col">{movesPanel}</div>
              )}
              {tab === "coach" && coachPanel}
              {tab === "engine" && enginePanel}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PlayerBar({
  player,
  color,
  active,
  highlight = false,
}: {
  player: ChessComGame["white"];
  color: "w" | "b";
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`cc-player ${highlight ? "cc-player--you" : ""} ${
        active ? "cc-player--active" : ""
      }`}
    >
      <span
        className={`cc-player-avatar ${
          color === "w" ? "cc-player-avatar--w" : "cc-player-avatar--b"
        }`}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold text-[var(--ink)]">
        {player.username}
      </span>
      <span className="shrink-0 text-[0.6875rem] text-[var(--ink-faint)] tabular-nums">
        {player.rating}
      </span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-active={active}
      onClick={onClick}
      className="review-tab"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
