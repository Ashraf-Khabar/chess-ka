import type { MoveQuality } from "@/features/analysis/lib/classifyMove";

/** PNG badges in /public/markers — replace these files with your own art. */
export const MARKER_PNG: Record<MoveQuality | "book", string> = {
  brilliant: "/markers/brilliant.png",
  great: "/markers/great.png",
  best: "/markers/best.png",
  excellent: "/markers/excellent.png",
  good: "/markers/good.png",
  inaccuracy: "/markers/inaccuracy.png",
  mistake: "/markers/mistake.png",
  miss: "/markers/miss.png",
  blunder: "/markers/blunder.png",
  book: "/markers/book.png",
};

export function markerSrc(kind: MoveQuality | "book"): string {
  return MARKER_PNG[kind];
}
