"use client";

import { useEffect, useState } from "react";
import type { MoveQuality } from "@/features/analysis/lib/classifyMove";
import { markerSrc } from "@/features/chessboard/lib/markerAssets";

const FILES = "abcdefgh";

/** Brief hold after classification so the badge appears once, cleanly. */
export const MARKER_SETTLE_MS = 220;

export function squareGridPos(
  square: string,
  orientation: "white" | "black"
): { col: number; row: number } | null {
  if (square.length < 2) return null;
  const file = FILES.indexOf(square[0]);
  const rank = Number.parseInt(square[1], 10) - 1;
  if (file < 0 || rank < 0 || rank > 7) return null;
  const col = orientation === "white" ? file : 7 - file;
  const row = orientation === "white" ? 7 - rank : rank;
  return { col, row };
}

interface SettledMarker {
  quality: MoveQuality;
  square: string;
  token: number;
}

/**
 * Waits until quality is stable for MARKER_SETTLE_MS before exposing a marker.
 * Clears immediately when the ply / square changes so old badges never linger.
 */
export function useSettledMoveMarker(
  quality: MoveQuality | null,
  square: string | null,
  plyIndex: number,
  enabled: boolean
): SettledMarker | null {
  const [settled, setSettled] = useState<SettledMarker | null>(null);

  useEffect(() => {
    setSettled(null);

    if (!enabled || !quality || !square) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSettled({
        quality,
        square,
        token: Date.now(),
      });
    }, MARKER_SETTLE_MS);

    return () => window.clearTimeout(timer);
  }, [enabled, quality, square, plyIndex]);

  return settled;
}

interface MoveQualityMarkerProps {
  quality: MoveQuality;
  square: string;
  orientation: "white" | "black";
  token: number;
}

export function MoveQualityMarker({
  quality,
  square,
  orientation,
  token,
}: MoveQualityMarkerProps) {
  const pos = squareGridPos(square, orientation);
  if (!pos) return null;

  return (
    <div
      className="move-quality-overlay"
      style={{
        left: `${(pos.col / 8) * 100}%`,
        top: `${(pos.row / 8) * 100}%`,
        width: "12.5%",
        height: "12.5%",
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={token}
        src={markerSrc(quality)}
        alt=""
        draggable={false}
        className={`move-quality-badge move-quality-marker--${quality} move-quality-marker-anim`}
      />
    </div>
  );
}
