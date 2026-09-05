import type { MoveQuality } from "@/features/analysis/lib/classifyMove";

/** Chess.com-inspired highlight colors for played-move squares. */
export const QUALITY_HIGHLIGHT: Record<
  MoveQuality,
  { from: string; to: string; marker: string; symbol: string }
> = {
  brilliant: {
    from: "rgba(27, 172, 166, 0.45)",
    to: "rgba(27, 172, 166, 0.72)",
    marker: "#1baca6",
    symbol: "!!",
  },
  great: {
    from: "rgba(46, 204, 187, 0.4)",
    to: "rgba(46, 204, 187, 0.7)",
    marker: "#2eccbb",
    symbol: "!",
  },
  best: {
    from: "rgba(150, 188, 75, 0.4)",
    to: "rgba(150, 188, 75, 0.7)",
    marker: "#96bc4b",
    symbol: "!",
  },
  excellent: {
    from: "rgba(150, 188, 75, 0.35)",
    to: "rgba(150, 188, 75, 0.6)",
    marker: "#81b64c",
    symbol: "!",
  },
  good: {
    from: "rgba(150, 188, 75, 0.28)",
    to: "rgba(150, 188, 75, 0.48)",
    marker: "#81b64c",
    symbol: "✓",
  },
  inaccuracy: {
    from: "rgba(247, 198, 49, 0.4)",
    to: "rgba(247, 198, 49, 0.7)",
    marker: "#f7c631",
    symbol: "?!",
  },
  mistake: {
    from: "rgba(230, 145, 44, 0.42)",
    to: "rgba(230, 145, 44, 0.72)",
    marker: "#e6912c",
    symbol: "?",
  },
  miss: {
    from: "rgba(232, 93, 76, 0.42)",
    to: "rgba(232, 93, 76, 0.72)",
    marker: "#e85d4c",
    symbol: "X",
  },
  blunder: {
    from: "rgba(202, 52, 49, 0.42)",
    to: "rgba(202, 52, 49, 0.75)",
    marker: "#ca3431",
    symbol: "??",
  },
};

export const SUGGESTION_ARROW_COLOR = "rgba(220, 48, 48, 0.95)";
export const LIVE_BEST_ARROW_COLOR = "rgba(100, 180, 255, 0.75)";
/** Gold arrow / wash for the move that was just played. */
export const LAST_MOVE_ARROW_COLOR = "rgba(246, 200, 70, 0.88)";

export const LAST_MOVE_HIGHLIGHT = {
  from: "rgba(246, 213, 92, 0.5)",
  to: "rgba(246, 213, 92, 0.72)",
} as const;

export function isSuboptimalQuality(quality: MoveQuality | null): boolean {
  return (
    quality === "inaccuracy" ||
    quality === "mistake" ||
    quality === "miss" ||
    quality === "blunder"
  );
}

export function parseUciSquares(uci: string | null): {
  from: string;
  to: string;
} | null {
  if (!uci || uci.length < 4) return null;
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) };
}
