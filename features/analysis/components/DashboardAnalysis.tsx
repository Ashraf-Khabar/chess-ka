"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Search, UploadCloud, Gauge } from "lucide-react";
import InteractiveBoard from "@/features/chessboard/components/InteractiveBoard";
import { useChessGame } from "@/features/chessboard/hooks/useChessGame";
import EnginePanel from "@/features/analysis/components/EnginePanel";
import MoveList from "@/features/analysis/components/MoveList";
import MoveCoachPanel from "@/features/analysis/components/MoveCoachPanel";
import GamesLibraryPanel from "@/features/analysis/components/GamesLibraryPanel";
import { useStockfish } from "@/features/analysis/hooks/useStockfish";
import { useMoveClassification } from "@/features/analysis/hooks/useMoveClassification";
import { uciToSan } from "@/features/analysis/lib/uci";
import type { ChessComGame } from "@/features/analysis/api/chessCom";
import { useSettings } from "@/features/settings/context/SettingsContext";
import {
  loadLibrary,
  saveLibrary,
} from "@/features/analysis/lib/gameSession";

interface GamesApiResponse {
  games: ChessComGame[];
  username: string;
  error?: string;
}

/**
 * Home studio: fetch Chess.com games (library) + free-play analysis board.
 * Detailed per-game review opens on /analyze/[gameId].
 */
export default function DashboardAnalysis() {
  const { settings, t } = useSettings();
  const [username, setUsername] = useState("");
  const [fetchedUsername, setFetchedUsername] = useState("");
  const [games, setGames] = useState<ChessComGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    { depth: Math.max(10, settings.engineDepth - 2), workerPath }
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

  const settledLiveBestUci = evaluation.isThinking
    ? null
    : evaluation.bestMove;

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
      setFetchedUsername(trimmed);

      try {
        const response = await fetch(
          `/api/chess-com/games?username=${encodeURIComponent(trimmed)}&limit=25&months=1`
        );
        const data = (await response.json()) as GamesApiResponse;
        if (!response.ok) {
          setError(data.error ?? "Fetch failed.");
          return;
        }
        setGames(data.games);
        saveLibrary({ username: trimmed, games: data.games });
      } catch {
        setError(
          settings.language === "fr"
            ? "Erreur réseau lors de la récupération."
            : "Network error while fetching games."
        );
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

  const boardSize = settings.boardSize;

  return (
    <div
      className={`studio-grid-3 ${
        boardSize === "xl"
          ? "board-focus-xl"
          : boardSize === "lg"
            ? "board-focus-lg"
            : ""
      }`}
    >
      <section className="fade-rise studio-side">
        <GamesLibraryPanel
          username={fetchedUsername}
          games={games}
          isLoading={isLoading}
          error={error}
        />

        <div className="panel-shell mt-4">
          <p className="eyebrow" suppressHydrationWarning>
            {t("session.eyebrow")}
          </p>
          <h3 className="font-display text-lg text-[var(--ink)]" suppressHydrationWarning>
            {t("session.title")}
          </h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="stat-tile">
              <dt className="text-[var(--ink-muted)]" suppressHydrationWarning>
                {t("session.games")}
              </dt>
              <dd className="font-display text-2xl text-[var(--ink)]">
                {games.length}
              </dd>
            </div>
            <div className="stat-tile">
              <dt className="text-[var(--ink-muted)]" suppressHydrationWarning>
                {t("session.plies")}
              </dt>
              <dd className="font-display text-2xl text-[var(--ink)]">
                {game.history.length}
              </dd>
            </div>
            <div className="stat-tile col-span-2">
              <dt className="flex items-center gap-1.5 text-[var(--ink-muted)]">
                <Gauge size={12} aria-hidden />
                <span suppressHydrationWarning>{t("session.quality")}</span>
              </dt>
              <dd className="font-display text-2xl text-[var(--accent)]">
                {accuracyHint}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="studio-main fade-rise">
        <div className="toolbar-shell">
          <div>
            <p className="eyebrow" suppressHydrationWarning>
              {t("studio.eyebrow")}
            </p>
            <h1
              className="font-display text-2xl text-[var(--ink)] sm:text-3xl"
              suppressHydrationWarning
            >
              {t("studio.title")}
            </h1>
          </div>

          <form
            onSubmit={handleFetchGames}
            className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t("studio.username")}
              className="field-input flex-1"
              autoComplete="username"
              aria-label={t("studio.username")}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Search size={16} />
              <span suppressHydrationWarning>
                {isLoading ? t("studio.fetching") : t("studio.fetch")}
              </span>
            </button>
          </form>

          <button
            type="button"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <UploadCloud size={16} />
            <span suppressHydrationWarning>{t("studio.importPgn")}</span>
          </button>
        </div>

        <p className="text-sm text-[var(--ink-muted)]" suppressHydrationWarning>
          {t("library.openReview")}
        </p>

        <div
          className={`grid gap-6 lg:items-start ${
            boardSize === "xl" || boardSize === "lg"
              ? "lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px]"
              : "lg:grid-cols-[minmax(0,1fr)_220px]"
          }`}
        >
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
            <p className="eyebrow" suppressHydrationWarning>
              {t("studio.moves")}
            </p>
            <MoveList
              history={game.history}
              plyIndex={game.plyIndex}
              onSelectPly={game.goToPly}
              mainLine={game.mainLine}
              forkPly={game.forkPly}
              variation={game.variation}
              isOnVariation={game.isOnVariation}
              onSelectMainPly={game.goToMainPly}
              currentQuality={classification.quality}
            />
          </div>
        </div>
      </section>

      <section className="fade-rise fade-rise-delay flex flex-col gap-4">
        <MoveCoachPanel
          classification={classification}
          bestMoveSan={bestMoveSan}
          suggestedBestSan={suggestedBestSan}
        />
        <EnginePanel
          evaluation={evaluation}
          sideToMove={sideToMove}
          bestMoveSan={bestMoveSan}
          classification={classification}
          suggestedBestSan={suggestedBestSan}
        />
      </section>
    </div>
  );
}
