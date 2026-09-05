"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Move } from "chess.js";
import {
  classifyMove,
  detectsMaterialSacrifice,
  fenBeforePly,
  moveToUci,
  toColorPovCp,
  type MoveQuality,
} from "@/features/analysis/lib/classifyMove";

export interface MoveClassification {
  quality: MoveQuality | null;
  lossCp: number | null;
  isEngineBest: boolean;
  isSacrifice: boolean;
  isClassifying: boolean;
  playedSan: string | null;
  /** Engine best move from the position *before* the played ply (UCI). */
  bestMoveUci: string | null;
  fenBefore: string | null;
  /** Ply this classification belongs to — keeps board markers in sync. */
  classifiedPly: number | null;
}

const EMPTY: MoveClassification = {
  quality: null,
  lossCp: null,
  isEngineBest: false,
  isSacrifice: false,
  isClassifying: false,
  playedSan: null,
  bestMoveUci: null,
  fenBefore: null,
  classifiedPly: null,
};

interface UseMoveClassificationOptions {
  depth?: number;
  workerPath?: string;
  /**
   * When false, skip engine classification.
   * Still exposes the played SAN for UI.
   */
  enabled?: boolean;
}

interface AfterEval {
  cp: number | null;
  mate: number | null;
  /** When true, the live engine is still searching the post-move position. */
  isThinking: boolean;
  depth: number;
}

/**
 * Classifies the move at the current ply by comparing:
 * - Stockfish eval of the position *before* the move
 * - Live eval of the position *after* the move (from useStockfish)
 *
 * Runs a dedicated worker so the live engine panel stays uninterrupted.
 */
export function useMoveClassification(
  history: Move[],
  plyIndex: number,
  afterEval: AfterEval,
  options: UseMoveClassificationOptions = {}
): MoveClassification {
  const {
    depth = 12,
    workerPath = "/engines/stockfish-nnue-16-single.js",
    enabled = true,
  } = options;

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const latestBeforeRef = useRef<{
    cp: number | null;
    mate: number | null;
    bestMove: string | null;
  }>({ cp: null, mate: null, bestMove: null });
  /** Ignore bestmove emitted by `stop` — only accept after `go`. */
  const acceptBestmoveRef = useRef(false);
  /** Prevents re-finalizing as live eval ticks — avoids symbol flicker. */
  const lockedPlyRef = useRef<number | null>(null);

  const [beforeReady, setBeforeReady] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState<MoveClassification>(EMPTY);

  const played: Move | null =
    plyIndex >= 0 && plyIndex < history.length ? history[plyIndex] : null;
  const fenBefore = fenBeforePly(history, plyIndex);
  const playedUci = played ? moveToUci(played) : null;
  const mover: "w" | "b" | null = played ? played.color : null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let worker: Worker;
    try {
      worker = new window.Worker(workerPath);
    } catch (error) {
      console.error("Failed to start classification worker:", error);
      return;
    }

    workerRef.current = worker;
    worker.postMessage("uci");
    worker.postMessage("isready");

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [workerPath]);

  const finalize = useCallback(
    (
      before: { cp: number | null; mate: number | null; bestMove: string | null },
      after: AfterEval,
      move: Move,
      uci: string,
      side: "w" | "b",
      beforeFen: string,
      ply: number
    ) => {
      if (!before.bestMove) return false;

      const afterSide: "w" | "b" = side === "w" ? "b" : "w";

      const evalBeforeMoverCp = toColorPovCp(
        before.cp,
        before.mate,
        side,
        side
      );
      const evalAfterMoverCp = toColorPovCp(
        after.cp,
        after.mate,
        afterSide,
        side
      );

      const lossCp = evalBeforeMoverCp - evalAfterMoverCp;
      const isEngineBest = before.bestMove === uci;
      const isSacrifice = detectsMaterialSacrifice(beforeFen, move);

      const quality = classifyMove({
        evalBeforeMoverCp,
        evalAfterMoverCp,
        isEngineBest,
        isSacrifice,
      });

      setResult({
        quality,
        lossCp,
        isEngineBest,
        isSacrifice,
        isClassifying: false,
        playedSan: move.san,
        bestMoveUci: before.bestMove,
        fenBefore: beforeFen,
        classifiedPly: ply,
      });
      setIsClassifying(false);
      return true;
    },
    []
  );

  useEffect(() => {
    const worker = workerRef.current;

    if (!enabled) {
      acceptBestmoveRef.current = false;
      setBeforeReady(false);
      setIsClassifying(false);
      setResult(
        played
          ? {
              ...EMPTY,
              playedSan: played.san,
              fenBefore,
              classifiedPly: plyIndex,
            }
          : EMPTY
      );
      return;
    }

    if (!worker || !fenBefore || !played || !playedUci || !mover) {
      acceptBestmoveRef.current = false;
      setResult(EMPTY);
      setBeforeReady(false);
      setIsClassifying(false);
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    latestBeforeRef.current = { cp: null, mate: null, bestMove: null };
    lockedPlyRef.current = null;
    acceptBestmoveRef.current = false;
    setBeforeReady(false);
    setIsClassifying(true);
    setResult({
      ...EMPTY,
      isClassifying: true,
      playedSan: played.san,
      fenBefore,
      classifiedPly: plyIndex,
    });

    const onMessage = (event: MessageEvent<string>) => {
      if (requestId !== requestIdRef.current) return;
      const line = String(event.data);

      if (line.startsWith("info ") && line.includes(" score ")) {
        const multipvMatch = line.match(/\bmultipv (\d+)/);
        if (multipvMatch && multipvMatch[1] !== "1") return;

        const cpMatch = line.match(/\bscore cp (-?\d+)/);
        const mateMatch = line.match(/\bscore mate (-?\d+)/);
        const pvMatch = line.match(/\bpv (.+)$/);

        if (cpMatch) {
          latestBeforeRef.current.cp = Number.parseInt(cpMatch[1], 10);
          latestBeforeRef.current.mate = null;
        }
        if (mateMatch) {
          latestBeforeRef.current.mate = Number.parseInt(mateMatch[1], 10);
          latestBeforeRef.current.cp = null;
        }
        if (pvMatch) {
          const pv = pvMatch[1].trim().split(/\s+/);
          const first = pv[0] ?? null;
          if (first && first !== "(none)") {
            latestBeforeRef.current.bestMove = first;
          }
        }
        // Mark that this search produced real output (not a stop echo)
        acceptBestmoveRef.current = true;
      }

      if (line.startsWith("bestmove ")) {
        // Ignore stop echoes — only accept after at least one scored info line
        if (!acceptBestmoveRef.current) return;

        const best = line.split(/\s+/)[1];
        if (best && best !== "(none)") {
          latestBeforeRef.current.bestMove = best;
        }
        acceptBestmoveRef.current = false;
        if (latestBeforeRef.current.bestMove) {
          setBeforeReady(true);
        }
      }
    };

    worker.addEventListener("message", onMessage);
    worker.postMessage("stop");
    worker.postMessage(`position fen ${fenBefore}`);
    worker.postMessage(`go depth ${depth}`);

    return () => {
      acceptBestmoveRef.current = false;
      worker.removeEventListener("message", onMessage);
      worker.postMessage("stop");
    };
  }, [depth, enabled, fenBefore, mover, played, playedUci, plyIndex]);

  useEffect(() => {
    if (!enabled) return;
    if (lockedPlyRef.current === plyIndex) return;

    const settleDepth = Math.min(depth, 10);
    const afterScoreMissing =
      afterEval.cp === null && afterEval.mate === null;
    const afterStillSearching =
      afterEval.isThinking || afterEval.depth < settleDepth;

    if (
      !beforeReady ||
      !played ||
      !playedUci ||
      !mover ||
      !fenBefore ||
      !latestBeforeRef.current.bestMove ||
      afterScoreMissing ||
      afterStillSearching
    ) {
      return;
    }

    const ok = finalize(
      latestBeforeRef.current,
      {
        cp: afterEval.cp,
        mate: afterEval.mate,
      },
      played,
      playedUci,
      mover,
      fenBefore,
      plyIndex
    );
    if (ok) {
      lockedPlyRef.current = plyIndex;
    }
  }, [
    afterEval.cp,
    afterEval.mate,
    afterEval.depth,
    afterEval.isThinking,
    beforeReady,
    depth,
    enabled,
    fenBefore,
    finalize,
    mover,
    played,
    playedUci,
    plyIndex,
  ]);

  const synced =
    result.classifiedPly === plyIndex &&
    !isClassifying &&
    !result.isClassifying;

  return {
    ...result,
    quality: synced ? result.quality : null,
    lossCp: synced ? result.lossCp : null,
    isEngineBest: synced ? result.isEngineBest : false,
    isSacrifice: synced ? result.isSacrifice : false,
    bestMoveUci: synced ? result.bestMoveUci : null,
    isClassifying: enabled && (isClassifying || result.isClassifying),
    classifiedPly: result.classifiedPly,
  };
}
