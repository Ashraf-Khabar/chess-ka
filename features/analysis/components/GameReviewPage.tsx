"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ListOrdered, MessageSquare, Cpu } from "lucide-react";
import InteractiveBoard from "@/features/chessboard/components/InteractiveBoard";
import { useChessGame } from "@/features/chessboard/hooks/useChessGame";
import EnginePanel from "@/features/analysis/components/EnginePanel";
import MoveList from "@/features/analysis/components/MoveList";
import MoveCoachPanel from "@/features/analysis/components/MoveCoachPanel";
import { useStockfish } from "@/features/analysis/hooks/useStockfish";
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
import { useSettings } from "@/features/settings/context/SettingsContext";

interface GameReviewPageProps {
  gameId: string;
}

type ReviewTab = "moves" | "coach" | "engine";

/**
 * Full-viewport Chess.com-like review — fits the screen without page scroll.
 */
export default function GameReviewPage({ gameId }: GameReviewPageProps) {
  const { t, settings } = useSettings();
  const [session, setSession] = useState<ActiveGameSession | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<ReviewTab>("moves");

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

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
    () =>
      session ? getPerspectiveColor(session.username, session.game) : null,
    [session]
  );

  const isUserPly = useMemo(() => {
    if (!perspectiveColor) return null;
    if (game.plyIndex < 0 || game.history.length === 0) return null;
    return isPerspectivePly(game.history, game.plyIndex, perspectiveColor);
  }, [game.history, game.plyIndex, perspectiveColor]);

  const opponentName = useMemo(
    () =>
      session ? getOpponentName(session.username, session.game) : null,
    [session]
  );

  const evaluation = useStockfish(game.fen, {
    depth: settings.engineDepth,
    workerPath,
    uiThrottleMs: 160,
  });

  // Symbols for both sides; coach text stays user-only via isUserPly
  const classification = useMoveClassification(
    game.history,
    game.plyIndex,
    {
      cp: evaluation.cp,
      mate: evaluation.mate,
      isThinking: evaluation.isThinking,
      depth: evaluation.depth,
    },
    {
      depth: Math.max(10, settings.engineDepth - 2),
      workerPath,
    }
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

  const settledLiveBestUci = evaluation.isThinking
    ? null
    : evaluation.bestMove;

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

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-[var(--ink-muted)]">
        <Loader2 className="animate-spin" size={20} />
        {t("review.loading")}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="panel-shell mx-auto mt-10 max-w-lg text-center">
        <p className="text-sm text-[var(--ink-muted)]">{t("review.missing")}</p>
        <Link href="/" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          {t("review.back")}
        </Link>
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

  return (
    <div className="review-shell">
      <header className="review-header-compact">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="review-back-btn"
          >
            <ArrowLeft size={12} />
            {t("review.back")}
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--ink)]">
              {chessGame.white.username}
              <span className="mx-1 font-normal text-[var(--ink-muted)]">vs</span>
              {chessGame.black.username}
            </p>
            <p className="text-[11px] text-[var(--ink-muted)] capitalize">
              {chessGame.time_class} ·{" "}
              {chessGame.rated ? t("review.rated") : t("review.casual")} ·{" "}
              <span suppressHydrationWarning>
                {formatGameEndDate(chessGame.end_time)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
              {t("review.accuracy")}
            </p>
            <p className="font-display text-xl leading-none text-[var(--accent)]">
              {accuracyHint}
            </p>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1.5 text-right">
            <p className="text-xs font-bold text-[var(--accent)]">{resultLabel}</p>
            <p className="text-[10px] text-[var(--ink-muted)]">
              {chessGame.white.rating}/{chessGame.black.rating}
            </p>
          </div>
        </div>
      </header>

      <div className="review-grid">
        <section className="review-board panel-shell">
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
            fillContainer
            hideSizeControls
          />
        </section>

        <aside className="review-side">
          <div className="review-tabs">
            <TabButton
              active={tab === "moves"}
              onClick={() => setTab("moves")}
              icon={<ListOrdered size={13} />}
              label={t("review.moves")}
            />
            {settings.showCoachPanel && (
              <TabButton
                active={tab === "coach"}
                onClick={() => setTab("coach")}
                icon={<MessageSquare size={13} />}
                label={t("coach.eyebrow")}
              />
            )}
            <TabButton
              active={tab === "engine"}
              onClick={() => setTab("engine")}
              icon={<Cpu size={13} />}
              label={t("engine.title")}
            />
          </div>

          <div className="review-tab-panel">
            {tab === "moves" && (
              <div className="panel-shell flex min-h-0 flex-1 flex-col !p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="eyebrow">{t("review.moves")}</p>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)]">
                    {username}
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <MoveList
                    history={game.history}
                    plyIndex={game.plyIndex}
                    onSelectPly={game.goToPly}
                    currentQuality={classification.quality}
                    compact
                  />
                </div>
              </div>
            )}

            {tab === "coach" && settings.showCoachPanel && (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <MoveCoachPanel
                  classification={classification}
                  bestMoveSan={bestMoveSan}
                  suggestedBestSan={suggestedBestSan}
                  isUserPly={isUserPly}
                  opponentName={opponentName}
                />
              </div>
            )}

            {tab === "engine" && (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <EnginePanel
                  evaluation={evaluation}
                  sideToMove={sideToMove}
                  bestMoveSan={bestMoveSan}
                  classification={classification}
                  suggestedBestSan={
                    isUserPly !== false ? suggestedBestSan : null
                  }
                  compact
                />
              </div>
            )}
          </div>
        </aside>
      </div>
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
      data-active={active}
      onClick={onClick}
      className="review-tab inline-flex items-center justify-center gap-1"
    >
      {icon}
      {label}
    </button>
  );
}
