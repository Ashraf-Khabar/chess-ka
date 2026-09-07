"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Cpu,
  Library,
  ListOrdered,
  MessageSquare,
  Search,
} from "lucide-react";
import InteractiveBoard from "@/features/chessboard/components/InteractiveBoard";
import { useChessGame } from "@/features/chessboard/hooks/useChessGame";
import AnalysisSheet, {
  type AnalysisSheetTab,
} from "@/features/analysis/components/AnalysisSheet";
import EnginePanel from "@/features/analysis/components/EnginePanel";
import MoveList from "@/features/analysis/components/MoveList";
import MoveCoachPanel from "@/features/analysis/components/MoveCoachPanel";
import GamesLibraryPanel from "@/features/analysis/components/GamesLibraryPanel";
import {
  formatEvaluation,
  useStockfish,
} from "@/features/analysis/hooks/useStockfish";
import { useMoveClassification } from "@/features/analysis/hooks/useMoveClassification";
import { uciToSan } from "@/features/analysis/lib/uci";
import type { ChessComGame } from "@/features/analysis/api/chessCom";
import { useMediaQuery } from "@/features/components/hooks/useMediaQuery";
import DeskDesktop from "@/features/components/layout/DeskDesktop";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { loadLibrary, saveLibrary } from "@/features/analysis/lib/gameSession";

interface GamesApiResponse {
  games: ChessComGame[];
  username: string;
  error?: string;
}

type DeskTab = "moves" | "coach" | "engine" | "library";

/**
 * Home desk: Chess.com library + free-play analysis board.
 * Mobile — sticky board with a snap sheet. Desktop — three-column match desk.
 * Detailed per-game review opens on /analyze/[gameId].
 */
export default function DashboardAnalysis() {
  const { settings, t } = useSettings();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [username, setUsername] = useState("");
  const [fetchedUsername, setFetchedUsername] = useState("");
  const [games, setGames] = useState<ChessComGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DeskTab>("coach");

  useEffect(() => {
    const library = loadLibrary();
    if (library?.games?.length) {
      setGames(library.games);
      setFetchedUsername(library.username);
      setUsername(library.username);
    }
  }, []);

  const game = useChessGame(null);
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

  const handleFetchGames = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = username.trim();
      if (!trimmed) {
        setError(
          settings.language === "fr"
            ? "Entrez un pseudo Chess.com."
            : "Enter a Chess.com username."
        );
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/chess-com/games?username=${encodeURIComponent(trimmed)}`
        );
        const data = (await response.json()) as GamesApiResponse;
        if (!response.ok) {
          throw new Error(data.error || "Fetch failed");
        }
        setGames(data.games);
        setFetchedUsername(data.username);
        saveLibrary({ username: data.username, games: data.games });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fetch failed");
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    },
    [settings.language, username]
  );

  const accuracyHint = useMemo(() => {
    if (!classification.quality || classification.lossCp === null) return "—";
    const loss = Math.max(0, classification.lossCp);
    return `${Math.max(0, Math.round(100 - loss / 3))}%`;
  }, [classification.lossCp, classification.quality]);

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

  const fetchForm = (
    <form onSubmit={handleFetchGames} className="flex flex-col gap-2">
      <label className="eyebrow" htmlFor="cpa-username">
        {t("studio.username")}
      </label>
      <input
        id="cpa-username"
        type="text"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="magnuscarlsen"
        className="field-input"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
      />
      <button type="submit" disabled={isLoading} className="btn-primary">
        <Search size={15} aria-hidden />
        <span suppressHydrationWarning>
          {isLoading ? t("studio.fetching") : t("studio.fetch")}
        </span>
      </button>
    </form>
  );

  const libraryPanel = (
    <GamesLibraryPanel
      username={fetchedUsername}
      games={games}
      isLoading={isLoading}
      error={error}
    />
  );

  const sessionStats = (
    <dl className="grid grid-cols-3 gap-px bg-[var(--line)]">
      <div className="stat-tile !border-0">
        <dt suppressHydrationWarning>{t("session.games")}</dt>
        <dd className="font-display text-xl text-[var(--ink)]">
          {games.length}
        </dd>
      </div>
      <div className="stat-tile !border-0">
        <dt suppressHydrationWarning>{t("session.plies")}</dt>
        <dd className="font-display text-xl text-[var(--ink)]">
          {game.history.length}
        </dd>
      </div>
      <div className="stat-tile !border-0">
        <dt suppressHydrationWarning>{t("session.quality")}</dt>
        <dd className="font-display text-xl text-[var(--accent)]">
          {accuracyHint}
        </dd>
      </div>
    </dl>
  );

  // Gate the layout until the media query has resolved so the board mounts once.
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
      {
        id: "library",
        label: t("library.eyebrow"),
        icon: <Library size={13} aria-hidden />,
        content: (
          <div className="flex flex-col gap-4">
            {fetchForm}
            {libraryPanel}
          </div>
        ),
      },
    ];

    return (
      <div className="desk-mobile">
        <div className="desk-board-sticky">{board}</div>

        <div className="desk-strip">
          <div className="min-w-0">
            <p className="eyebrow" suppressHydrationWarning>
              {t("studio.eyebrow")}
            </p>
            <h1 className="truncate" suppressHydrationWarning>
              {t("studio.title")}
            </h1>
          </div>
          <span className="desk-strip-eval">{evalLabel}</span>
        </div>

        <div className="desk-mobile-body">
          {sessionStats}
          <p className="text-xs leading-relaxed text-[var(--ink-faint)]">
            {t("library.openReview")}
          </p>
        </div>

        <AnalysisSheet
          tabs={tabs}
          activeTab={tab}
          onTabChange={(id) => setTab(id as DeskTab)}
          peek={evalLabel}
        />
      </div>
    );
  }

  return (
    <DeskDesktop
      storageKey="cpa-desk-analysis"
      leftLabel={t("library.title")}
      rightLabel={t("engine.title")}
      left={
        <>
          <div className="rail-block">{fetchForm}</div>
          {libraryPanel}
          <div className="rail-block">
            <p className="eyebrow mb-2" suppressHydrationWarning>
              {t("session.eyebrow")}
            </p>
            {sessionStats}
          </div>
        </>
      }
      right={
        <>
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
            <p className="eyebrow" suppressHydrationWarning>
              {t("studio.eyebrow")}
            </p>
            <h1 suppressHydrationWarning>{t("studio.title")}</h1>
            <div className="desk-masthead-meta">
              <span className="chip chip--accent">{t("desk.play")}</span>
              <span className="text-xs text-[var(--ink-faint)]">
                {t("library.openReview")}
              </span>
            </div>
          </div>
          <div className="desk-board">{board}</div>
        </>
      }
    />
  );
}
