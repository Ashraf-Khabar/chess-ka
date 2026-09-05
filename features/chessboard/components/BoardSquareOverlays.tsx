"use client";

import { squareGridPos } from "@/features/chessboard/components/MoveQualityMarker";
import { markerSrc } from "@/features/chessboard/lib/markerAssets";

interface SquareOverlayBaseProps {
  square: string;
  orientation: "white" | "black";
}

/** Full-square blur + corner spinner while Stockfish classifies. */
export function SquareClassifyLoader({
  square,
  orientation,
}: SquareOverlayBaseProps) {
  const pos = squareGridPos(square, orientation);
  if (!pos) return null;

  return (
    <div
      className="move-classify-layer move-quality-overlay"
      style={{
        left: `${(pos.col / 8) * 100}%`,
        top: `${(pos.row / 8) * 100}%`,
        width: "12.5%",
        height: "12.5%",
      }}
      aria-hidden
    >
      <div className="square-classify-blur" />
      <span className="square-classify-loader">
        <span className="square-classify-loader-ring" />
      </span>
    </div>
  );
}

/** Book / opening theory badge (PNG). */
export function BookMoveMarker({
  square,
  orientation,
  token,
}: SquareOverlayBaseProps & { token: number }) {
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
        src={markerSrc("book")}
        alt=""
        draggable={false}
        className="move-quality-badge move-quality-marker--book move-quality-marker-anim"
      />
    </div>
  );
}
