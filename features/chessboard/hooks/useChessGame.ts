"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Move, type Square } from "chess.js";

export interface UseChessGameResult {
  fen: string;
  /** Active path currently viewed (main line, or main prefix + variation). */
  history: Move[];
  plyIndex: number;
  /** Original loaded / played main game line. */
  mainLine: Move[];
  /** Last main-line ply kept before the fork (`null` = on main line). */
  forkPly: number | null;
  /** Moves after `forkPly` that diverge from the main game. */
  variation: Move[];
  isOnVariation: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  lastMove: Move | null;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  loadPgn: (pgn: string) => boolean;
  goToPly: (ply: number) => void;
  /** Leave the variation and jump to a ply on the main game. */
  goToMainPly: (ply: number) => void;
  /** Leave the variation and return to the fork position (last real game ply). */
  returnToFork: () => void;
  goBack: () => void;
  goForward: () => void;
  goStart: () => void;
  goEnd: () => void;
  reset: () => void;
}

interface GameView {
  fen: string;
  history: Move[];
  plyIndex: number;
  mainLine: Move[];
  forkPly: number | null;
  variation: Move[];
  /**
   * When true (PGN / imported game), the main line must not grow —
   * any alternate or post-game move becomes a variation.
   */
  mainLineLocked: boolean;
}

function sameMove(
  a: Pick<Move, "from" | "to" | "promotion">,
  b: Pick<Move, "from" | "to" | "promotion">
): boolean {
  return (
    a.from === b.from &&
    a.to === b.to &&
    (a.promotion ?? undefined) === (b.promotion ?? undefined)
  );
}

/**
 * Central chess.js controller with a single React state update per action
 * so the board FEN and ply index stay in sync (no animation stutter).
 *
 * Supports one active side-line (fork) while keeping the main game intact.
 */
export function useChessGame(
  initialPgn?: string | null,
  options: { startAtEnd?: boolean } = {}
): UseChessGameResult {
  const masterRef = useRef(new Chess());
  const startAtEnd = options.startAtEnd ?? false;
  const [view, setView] = useState<GameView>(() => ({
    fen: new Chess().fen(),
    history: [],
    plyIndex: -1,
    mainLine: [],
    forkPly: null,
    variation: [],
    mainLineLocked: false,
  }));

  const buildFenAtPly = useCallback((moves: Move[], ply: number): string => {
    const board = new Chess();
    const clamped = Math.max(-1, Math.min(ply, moves.length - 1));
    for (let i = 0; i <= clamped; i += 1) {
      const move = moves[i];
      board.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
    }
    return board.fen();
  }, []);

  const commitView = useCallback(
    (
      moves: Move[],
      ply: number,
      mainLine: Move[],
      forkPly: number | null,
      variation: Move[],
      mainLineLocked: boolean
    ) => {
      const clamped = Math.max(-1, Math.min(ply, moves.length - 1));
      setView({
        history: moves,
        plyIndex: clamped,
        fen: buildFenAtPly(moves, clamped),
        mainLine,
        forkPly,
        variation,
        mainLineLocked,
      });
    },
    [buildFenAtPly]
  );

  const loadPgn = useCallback(
    (pgn: string, atEnd = startAtEnd): boolean => {
      try {
        const master = new Chess();
        master.loadPgn(pgn);
        const moves = master.history({ verbose: true });
        masterRef.current = master;
        commitView(
          moves,
          atEnd ? moves.length - 1 : -1,
          moves,
          null,
          [],
          true
        );
        return true;
      } catch (error) {
        console.error("Invalid PGN:", error);
        return false;
      }
    },
    [commitView, startAtEnd]
  );

  useEffect(() => {
    if (initialPgn) loadPgn(initialPgn, startAtEnd);
  }, [initialPgn, loadPgn, startAtEnd]);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion = "q"): boolean => {
      try {
        const base = new Chess();
        for (let i = 0; i <= view.plyIndex; i += 1) {
          const past = view.history[i];
          base.move({
            from: past.from,
            to: past.to,
            promotion: past.promotion,
          });
        }

        const played = base.move({ from, to, promotion });
        if (!played) return false;

        masterRef.current = base;
        const { mainLine, forkPly, variation, plyIndex, mainLineLocked } =
          view;

        // Already exploring a side-line — keep extending / rewriting it
        if (forkPly !== null) {
          const prefixLen = forkPly + 1;
          const varCursor = plyIndex - prefixLen; // -1 if standing on fork ply
          const nextVariation = [
            ...variation.slice(0, Math.max(0, varCursor + 1)),
            played,
          ];
          const nextHistory = [
            ...mainLine.slice(0, prefixLen),
            ...nextVariation,
          ];
          commitView(
            nextHistory,
            nextHistory.length - 1,
            mainLine,
            forkPly,
            nextVariation,
            mainLineLocked
          );
          return true;
        }

        // On main line
        const expected = mainLine[plyIndex + 1];
        if (expected && sameMove(expected, played)) {
          commitView(mainLine, plyIndex + 1, mainLine, null, [], mainLineLocked);
          return true;
        }

        const pastEnd = !expected;
        const diverges = Boolean(expected);

        // Imported game: any new idea (mid-game or after the last move) = fork
        if (mainLineLocked && (diverges || pastEnd)) {
          const nextFork = plyIndex;
          const nextVariation = [played];
          const nextHistory = [
            ...mainLine.slice(0, nextFork + 1),
            ...nextVariation,
          ];
          commitView(
            nextHistory,
            nextHistory.length - 1,
            mainLine,
            nextFork,
            nextVariation,
            true
          );
          return true;
        }

        // Free play: grow the main line
        if (pastEnd) {
          const nextMain = [...mainLine.slice(0, plyIndex + 1), played];
          commitView(nextMain, nextMain.length - 1, nextMain, null, [], false);
          return true;
        }

        // Free play: go back and play something else → fork
        const nextFork = plyIndex;
        const nextVariation = [played];
        const nextHistory = [
          ...mainLine.slice(0, nextFork + 1),
          ...nextVariation,
        ];
        commitView(
          nextHistory,
          nextHistory.length - 1,
          mainLine,
          nextFork,
          nextVariation,
          false
        );
        return true;
      } catch {
        return false;
      }
    },
    [commitView, view]
  );

  const goToPly = useCallback(
    (ply: number) =>
      commitView(
        view.history,
        ply,
        view.mainLine,
        view.forkPly,
        view.variation,
        view.mainLineLocked
      ),
    [
      commitView,
      view.forkPly,
      view.history,
      view.mainLine,
      view.mainLineLocked,
      view.variation,
    ]
  );

  const goToMainPly = useCallback(
    (ply: number) =>
      commitView(
        view.mainLine,
        ply,
        view.mainLine,
        null,
        [],
        view.mainLineLocked
      ),
    [commitView, view.mainLine, view.mainLineLocked]
  );

  const returnToFork = useCallback(() => {
    if (view.forkPly === null) return;
    commitView(
      view.mainLine,
      view.forkPly,
      view.mainLine,
      null,
      [],
      view.mainLineLocked
    );
  }, [commitView, view.forkPly, view.mainLine, view.mainLineLocked]);

  const goBack = useCallback(
    () =>
      commitView(
        view.history,
        view.plyIndex - 1,
        view.mainLine,
        view.forkPly,
        view.variation,
        view.mainLineLocked
      ),
    [
      commitView,
      view.forkPly,
      view.history,
      view.mainLine,
      view.mainLineLocked,
      view.plyIndex,
      view.variation,
    ]
  );

  const goForward = useCallback(
    () =>
      commitView(
        view.history,
        view.plyIndex + 1,
        view.mainLine,
        view.forkPly,
        view.variation,
        view.mainLineLocked
      ),
    [
      commitView,
      view.forkPly,
      view.history,
      view.mainLine,
      view.mainLineLocked,
      view.plyIndex,
      view.variation,
    ]
  );

  const goStart = useCallback(
    () =>
      commitView(
        view.history,
        -1,
        view.mainLine,
        view.forkPly,
        view.variation,
        view.mainLineLocked
      ),
    [
      commitView,
      view.forkPly,
      view.history,
      view.mainLine,
      view.mainLineLocked,
      view.variation,
    ]
  );

  const goEnd = useCallback(
    () =>
      commitView(
        view.history,
        view.history.length - 1,
        view.mainLine,
        view.forkPly,
        view.variation,
        view.mainLineLocked
      ),
    [
      commitView,
      view.forkPly,
      view.history,
      view.mainLine,
      view.mainLineLocked,
      view.variation,
    ]
  );

  const reset = useCallback(() => {
    masterRef.current = new Chess();
    setView({
      fen: masterRef.current.fen(),
      history: [],
      plyIndex: -1,
      mainLine: [],
      forkPly: null,
      variation: [],
      mainLineLocked: false,
    });
  }, []);

  return {
    fen: view.fen,
    history: view.history,
    plyIndex: view.plyIndex,
    mainLine: view.mainLine,
    forkPly: view.forkPly,
    variation: view.variation,
    isOnVariation: view.forkPly !== null,
    canGoBack: view.plyIndex >= 0,
    canGoForward: view.plyIndex < view.history.length - 1,
    lastMove:
      view.plyIndex >= 0 ? view.history[view.plyIndex] ?? null : null,
    makeMove,
    loadPgn,
    goToPly,
    goToMainPly,
    returnToFork,
    goBack,
    goForward,
    goStart,
    goEnd,
    reset,
  };
}
