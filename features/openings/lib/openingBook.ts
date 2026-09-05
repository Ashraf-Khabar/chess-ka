import type { Move } from "chess.js";
import { moveToUci } from "@/features/analysis/lib/classifyMove";

export interface OpeningLine {
  id: string;
  eco: string;
  nameFr: string;
  nameEn: string;
  /** Main line as UCI plies from the start position. */
  uciMoves: string[];
}

/** Compact repertoire used for book badges + the openings catalog. */
export const OPENING_LINES: OpeningLine[] = [
  {
    id: "italian",
    eco: "C50",
    nameFr: "Italienne",
    nameEn: "Italian Game",
    uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
  },
  {
    id: "spanish",
    eco: "C60",
    nameFr: "Espagnole (Ruy Lopez)",
    nameEn: "Ruy Lopez",
    uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
  },
  {
    id: "sicilian",
    eco: "B20",
    nameFr: "Sicilienne",
    nameEn: "Sicilian Defence",
    uciMoves: ["e2e4", "c7c5"],
  },
  {
    id: "sicilian-najdorf",
    eco: "B90",
    nameFr: "Sicilienne Najdorf",
    nameEn: "Sicilian Najdorf",
    uciMoves: [
      "e2e4",
      "c7c5",
      "g1f3",
      "d7d6",
      "d2d4",
      "c5d4",
      "f3d4",
      "g8f6",
      "b1c3",
      "a7a6",
    ],
  },
  {
    id: "french",
    eco: "C00",
    nameFr: "Française",
    nameEn: "French Defence",
    uciMoves: ["e2e4", "e7e6"],
  },
  {
    id: "caro",
    eco: "B10",
    nameFr: "Caro-Kann",
    nameEn: "Caro-Kann",
    uciMoves: ["e2e4", "c7c6"],
  },
  {
    id: "queens-gambit",
    eco: "D06",
    nameFr: "Gambit dame",
    nameEn: "Queen’s Gambit",
    uciMoves: ["d2d4", "d7d5", "c2c4"],
  },
  {
    id: "kings-indian",
    eco: "E60",
    nameFr: "Est-indienne",
    nameEn: "King’s Indian",
    uciMoves: ["d2d4", "g8f6", "c2c4", "g7g6"],
  },
  {
    id: "english",
    eco: "A10",
    nameFr: "Anglaise",
    nameEn: "English Opening",
    uciMoves: ["c2c4"],
  },
  {
    id: "scotch",
    eco: "C45",
    nameFr: "Écossaise",
    nameEn: "Scotch Game",
    uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4"],
  },
];

function historyUci(history: Move[], throughPly: number): string[] {
  const end = Math.min(throughPly + 1, history.length);
  const out: string[] = [];
  for (let i = 0; i < end; i += 1) {
    out.push(moveToUci(history[i]));
  }
  return out;
}

/** True when the line up to `plyIndex` matches at least one opening book line. */
export function isBookPly(history: Move[], plyIndex: number): boolean {
  if (plyIndex < 0 || plyIndex >= history.length) return false;
  const played = historyUci(history, plyIndex);
  return OPENING_LINES.some((line) => {
    if (played.length > line.uciMoves.length) return false;
    return played.every((uci, i) => uci === line.uciMoves[i]);
  });
}

/** Best matching opening for the current prefix (longest match wins). */
export function matchOpening(
  history: Move[],
  plyIndex: number
): OpeningLine | null {
  if (plyIndex < 0) {
    return null;
  }
  const played = historyUci(history, Math.min(plyIndex, history.length - 1));
  if (played.length === 0) return null;

  let best: OpeningLine | null = null;
  for (const line of OPENING_LINES) {
    const len = Math.min(played.length, line.uciMoves.length);
    let ok = true;
    for (let i = 0; i < len; i += 1) {
      if (played[i] !== line.uciMoves[i]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (!best || line.uciMoves.length > best.uciMoves.length) {
      best = line;
    }
  }
  return best;
}
