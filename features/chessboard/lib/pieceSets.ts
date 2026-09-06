"use client";

import { createElement, type CSSProperties } from "react";
import { defaultPieces } from "react-chessboard";
import type { PieceRenderObject } from "react-chessboard";

export type PieceStyle =
  | "classic"
  | "mono"
  | "warm"
  | "cool"
  | "ink"
  | "alpha";

export const PIECE_STYLE_OPTIONS: {
  value: PieceStyle;
  preview: string;
}[] = [
  { value: "classic", preview: "♞" },
  { value: "mono", preview: "♞" },
  { value: "warm", preview: "♞" },
  { value: "cool", preview: "♞" },
  { value: "ink", preview: "♞" },
  { value: "alpha", preview: "♘" },
];

const UNICODE: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

const FILTERS: Partial<Record<PieceStyle, string>> = {
  mono: "grayscale(1) contrast(1.2)",
  warm: "sepia(0.42) saturate(1.25)",
  cool: "hue-rotate(165deg) saturate(0.9)",
  ink: "contrast(1.15) brightness(0.92) saturate(0.75)",
};

function wrapDefault(filter?: string): PieceRenderObject {
  const result = {} as PieceRenderObject;
  for (const [key, render] of Object.entries(defaultPieces)) {
    result[key] = (props) =>
      createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            filter: filter || undefined,
          } satisfies CSSProperties,
        },
        render(props)
      );
  }
  return result;
}

function unicodePieces(): PieceRenderObject {
  const result = {} as PieceRenderObject;
  for (const [key, glyph] of Object.entries(UNICODE)) {
    const isWhite = key.startsWith("w");
    result[key] = (props) =>
      createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "78%",
            lineHeight: 1,
            color: isWhite ? "#f7f4ee" : "#1a1a1a",
            textShadow: isWhite
              ? "0 1px 0 rgba(0,0,0,.55), 0 0 1px rgba(0,0,0,.8)"
              : "0 1px 0 rgba(255,255,255,.25)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            userSelect: "none",
            ...(props?.svgStyle ?? {}),
          } satisfies CSSProperties,
        },
        glyph
      );
  }
  return result;
}

const CACHE = new Map<PieceStyle, PieceRenderObject>();

/**
 * Returns a react-chessboard `pieces` map for the selected style.
 */
export function getPieceRenderers(style: PieceStyle): PieceRenderObject {
  const cached = CACHE.get(style);
  if (cached) return cached;

  let built: PieceRenderObject;
  if (style === "alpha") {
    built = unicodePieces();
  } else if (style === "classic") {
    built = defaultPieces;
  } else {
    built = wrapDefault(FILTERS[style]);
  }

  CACHE.set(style, built);
  return built;
}
