"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Move, type Square } from "chess.js";

export interface UseChessGameResult {
  fen: string;
  history: Move[];
  plyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  lastMove: Move | null;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  loadPgn: (pgn: string) => boolean;
  goToPly: (ply: number) => void;
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
}

/**
 * Central chess.js controller with a single React state update per action
 * so the board FEN and ply index stay in sync (no animation stutter).
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
    (moves: Move[], ply: number) => {
      const clamped = Math.max(-1, Math.min(ply, moves.length - 1));
      setView({
        history: moves,
        plyIndex: clamped,
        fen: buildFenAtPly(moves, clamped),
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
        commitView(moves, atEnd ? moves.length - 1 : -1);
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

        const nextHistory = [...view.history.slice(0, view.plyIndex + 1), played];
        masterRef.current = base;
        commitView(nextHistory, nextHistory.length - 1);
        return true;
      } catch {
        return false;
      }
    },
    [commitView, view.history, view.plyIndex]
  );

  const goToPly = useCallback(
    (ply: number) => commitView(view.history, ply),
    [commitView, view.history]
  );

  const goBack = useCallback(
    () => commitView(view.history, view.plyIndex - 1),
    [commitView, view.history, view.plyIndex]
  );

  const goForward = useCallback(
    () => commitView(view.history, view.plyIndex + 1),
    [commitView, view.history, view.plyIndex]
  );

  const goStart = useCallback(
    () => commitView(view.history, -1),
    [commitView, view.history]
  );

  const goEnd = useCallback(
    () => commitView(view.history, view.history.length - 1),
    [commitView, view.history]
  );

  const reset = useCallback(() => {
    masterRef.current = new Chess();
    setView({
      fen: masterRef.current.fen(),
      history: [],
      plyIndex: -1,
    });
  }, []);

  return {
    fen: view.fen,
    history: view.history,
    plyIndex: view.plyIndex,
    canGoBack: view.plyIndex >= 0,
    canGoForward: view.plyIndex < view.history.length - 1,
    lastMove:
      view.plyIndex >= 0 ? view.history[view.plyIndex] ?? null : null,
    makeMove,
    loadPgn,
    goToPly,
    goBack,
    goForward,
    goStart,
    goEnd,
    reset,
  };
}
