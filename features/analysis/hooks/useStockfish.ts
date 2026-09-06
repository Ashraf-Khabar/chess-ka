"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { configureStockfishWorker } from "@/features/analysis/lib/stockfishConfig";

export interface StockfishEvaluation {
  cp: number | null;
  mate: number | null;
  bestMove: string | null;
  pv: string[];
  depth: number;
  isReady: boolean;
  isThinking: boolean;
  error: string | null;
}

const INITIAL_EVAL: StockfishEvaluation = {
  cp: 0,
  mate: null,
  bestMove: null,
  pv: [],
  depth: 0,
  isReady: false,
  isThinking: false,
  error: null,
};

interface UseStockfishOptions {
  depth?: number;
  workerPath?: string;
  /** Throttle UI updates while searching (keeps board animation fluid). */
  uiThrottleMs?: number;
}

/**
 * Stockfish Web Worker hook.
 * Throttles mid-search `info` updates so the chessboard is not re-rendered
 * on every depth tick (that was causing move animation stutter).
 */
export function useStockfish(
  fen: string,
  options: UseStockfishOptions = {}
): StockfishEvaluation {
  const {
    depth = 18,
    workerPath = "/engines/stockfish-nnue-16-single.js",
    uiThrottleMs = 140,
  } = options;

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const latestRef = useRef<StockfishEvaluation>(INITIAL_EVAL);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [evaluation, setEvaluation] = useState<StockfishEvaluation>(INITIAL_EVAL);

  const publish = useCallback(
    (next: StockfishEvaluation, immediate = false) => {
      latestRef.current = next;
      if (immediate) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setEvaluation(next);
        return;
      }

      if (timerRef.current) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setEvaluation(latestRef.current);
      }, uiThrottleMs);
    },
    [uiThrottleMs]
  );

  const handleEngineLine = useCallback(
    (line: string, requestId: number) => {
      if (requestId !== requestIdRef.current) return;

      if (line.startsWith("info ") && line.includes(" score ")) {
        const multipvMatch = line.match(/\bmultipv (\d+)/);
        if (multipvMatch && multipvMatch[1] !== "1") return;

        const depthMatch = line.match(/\bdepth (\d+)/);
        const cpMatch = line.match(/\bscore cp (-?\d+)/);
        const mateMatch = line.match(/\bscore mate (-?\d+)/);
        const pvMatch = line.match(/\bpv (.+)$/);

        const next: StockfishEvaluation = {
          ...latestRef.current,
          isThinking: true,
          isReady: true,
          error: null,
        };

        if (depthMatch) next.depth = Number.parseInt(depthMatch[1], 10);
        if (cpMatch) {
          next.cp = Number.parseInt(cpMatch[1], 10);
          next.mate = null;
        }
        if (mateMatch) {
          next.mate = Number.parseInt(mateMatch[1], 10);
          next.cp = null;
        }
        if (pvMatch) {
          next.pv = pvMatch[1].trim().split(/\s+/);
          next.bestMove = next.pv[0] ?? null;
        }

        publish(next);
      }

      if (line.startsWith("bestmove ")) {
        const best = line.split(/\s+/)[1];
        publish(
          {
            ...latestRef.current,
            bestMove: best && best !== "(none)" ? best : latestRef.current.bestMove,
            isThinking: false,
            isReady: true,
          },
          true
        );
      }
    },
    [publish]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let worker: Worker;
    try {
      worker = new window.Worker(workerPath);
    } catch (error) {
      setEvaluation((prev) => ({
        ...prev,
        error: "Failed to start Stockfish worker.",
        isReady: false,
      }));
      console.error(error);
      return;
    }

    workerRef.current = worker;
    const onMessage = (event: MessageEvent<string>) => {
      handleEngineLine(String(event.data), requestIdRef.current);
    };

    worker.addEventListener("message", onMessage);
    configureStockfishWorker(worker);

    const ready = { ...latestRef.current, isReady: true, error: null };
    latestRef.current = ready;
    setEvaluation(ready);

    return () => {
      worker.removeEventListener("message", onMessage);
      worker.terminate();
      workerRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleEngineLine, workerPath]);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker || !fen) return;

    requestIdRef.current += 1;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const searching: StockfishEvaluation = {
      ...latestRef.current,
      isThinking: true,
      depth: 0,
      bestMove: null,
      pv: [],
    };
    latestRef.current = searching;
    setEvaluation(searching);

    worker.postMessage("stop");
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);

    return () => {
      worker.postMessage("stop");
    };
  }, [fen, depth]);

  return evaluation;
}

export function formatEvaluation(
  cp: number | null,
  mate: number | null,
  sideToMove: "w" | "b" = "w"
): string {
  const perspective = sideToMove === "w" ? 1 : -1;

  if (mate !== null) {
    const whiteMate = mate * perspective;
    return whiteMate > 0 ? `M${whiteMate}` : `-M${Math.abs(whiteMate)}`;
  }

  if (cp === null) return "0.00";

  const whiteCp = cp * perspective;
  const pawns = whiteCp / 100;
  const sign = pawns > 0 ? "+" : "";
  return `${sign}${pawns.toFixed(2)}`;
}
