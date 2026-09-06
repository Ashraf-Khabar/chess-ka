import { Chess, type Move, type PieceSymbol } from "chess.js";

/**
 * Move-quality labels used across the analysis UI.
 * Positive: brilliant > great > best > excellent > good
 * Negative: inaccuracy < mistake < miss < blunder
 */
export type MoveQuality =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "miss"
  | "blunder";

export const MOVE_QUALITY_LABEL: Record<MoveQuality, string> = {
  brilliant: "Brilliant",
  great: "Great",
  best: "Best",
  excellent: "Excellent",
  good: "Good",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  miss: "Miss",
  blunder: "Blunder",
};

export const MOVE_QUALITY_LABEL_FR: Record<MoveQuality, string> = {
  brilliant: "Brillant",
  great: "Superbe",
  best: "Meilleur",
  excellent: "Excellent",
  good: "Bon",
  inaccuracy: "Imprécision",
  mistake: "Erreur",
  miss: "Occasion manquée",
  blunder: "Gaffe",
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/** Convert a UCI/mate score (side-to-move POV) into a single centipawn number. */
export function scoreToCp(cp: number | null, mate: number | null): number {
  if (mate !== null) {
    // Prefer faster mates; keep polarity of the mate score
    return mate > 0 ? 100_000 - mate * 100 : -100_000 - mate * 100;
  }
  return cp ?? 0;
}

/**
 * Re-express a side-to-move score as the given color's perspective.
 */
export function toColorPovCp(
  cp: number | null,
  mate: number | null,
  sideToMove: "w" | "b",
  color: "w" | "b"
): number {
  const stmCp = scoreToCp(cp, mate);
  return sideToMove === color ? stmCp : -stmCp;
}

/**
 * Centipawn thresholds (mover POV loss vs the pre-move evaluation).
 * Stricter bands — closer to Chess.com-style harshness on CP proxies.
 */
export function classifyCentipawnLoss(
  lossCp: number
): Exclude<MoveQuality, "brilliant" | "great" | "miss"> {
  const loss = Math.max(0, lossCp);

  if (loss <= 5) return "best";
  if (loss <= 20) return "excellent";
  if (loss <= 50) return "good";
  if (loss <= 100) return "inaccuracy";
  if (loss <= 200) return "mistake";
  return "blunder";
}

/**
 * Detects a material sacrifice: the mover leaves a piece hanging for a net
 * loss of at least ~2 pawns of value (classic "sac" shape).
 */
export function detectsMaterialSacrifice(
  fenBefore: string,
  played: Pick<Move, "from" | "to" | "promotion" | "captured">
): boolean {
  try {
    const after = new Chess(fenBefore);
    const result = after.move({
      from: played.from,
      to: played.to,
      promotion: played.promotion,
    });
    if (!result) return false;

    const pieceOnTarget = after.get(played.to);
    if (!pieceOnTarget) return false;

    // Can the opponent capture the piece we just moved/left on `to`?
    const replies = after.moves({ verbose: true });
    const canCapture = replies.some(
      (reply) => reply.to === played.to && Boolean(reply.captured)
    );
    if (!canCapture) return false;

    const ourValue = PIECE_VALUES[pieceOnTarget.type];
    const gained = played.captured ? PIECE_VALUES[played.captured] : 0;
    // Net material we are offering if the opponent takes for free / cheaply
    return ourValue - gained >= 2;
  } catch {
    return false;
  }
}

export interface ClassifyMoveInput {
  /** Evaluation before the move, from the mover's perspective (cp). */
  evalBeforeMoverCp: number;
  /** Evaluation after the move, from the mover's perspective (cp). */
  evalAfterMoverCp: number;
  /** True when the played UCI matches Stockfish's best move. */
  isEngineBest: boolean;
  /** True when the move hangs material worth a sacrifice. */
  isSacrifice: boolean;
}

/**
 * Full classifier: CP-loss bands + Great / Brilliant / Miss overrides.
 */
export function classifyMove(input: ClassifyMoveInput): MoveQuality {
  const lossCp = input.evalBeforeMoverCp - input.evalAfterMoverCp;
  const gainCp = input.evalAfterMoverCp - input.evalBeforeMoverCp;
  const base = classifyCentipawnLoss(lossCp);

  const nearBest = input.isEngineBest || lossCp <= 12;
  const stillStrong =
    input.evalAfterMoverCp >= 150 ||
    input.evalAfterMoverCp >= input.evalBeforeMoverCp - 30;

  // Brilliant: sound sacrifice that stays near the engine best line
  if (input.isSacrifice && nearBest && stillStrong) {
    return "brilliant";
  }

  // Great: engine best (or tiny loss) that swings the eval hard in your favor
  const bigSwing = gainCp >= 100;
  const clutchBest =
    input.isEngineBest &&
    lossCp <= 5 &&
    input.evalAfterMoverCp >= 120 &&
    gainCp >= 50;

  if (nearBest && (bigSwing || clutchBest)) {
    return "great";
  }

  // Exact engine choice with tiny loss stays "best"
  if (input.isEngineBest && lossCp <= 8) {
    return "best";
  }

  // Miss: you had a winning (or crushing) chance and let it slip
  const hadWinningChance =
    input.evalBeforeMoverCp >= 180 || input.evalBeforeMoverCp >= 10_000;
  const threwWin =
    !input.isEngineBest &&
    lossCp >= 120 &&
    hadWinningChance &&
    input.evalAfterMoverCp < input.evalBeforeMoverCp - 100;

  if (threwWin && (base === "mistake" || base === "blunder")) {
    return "miss";
  }

  return base;
}

/** Build a UCI string from a chess.js verbose move. */
export function moveToUci(move: Pick<Move, "from" | "to" | "promotion">): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

/**
 * Reconstruct the FEN immediately before `plyIndex` was played.
 */
export function fenBeforePly(
  history: Move[],
  plyIndex: number
): string | null {
  if (plyIndex < 0 || plyIndex >= history.length) return null;

  const game = new Chess();
  for (let i = 0; i < plyIndex; i += 1) {
    const ply = history[i];
    game.move({
      from: ply.from,
      to: ply.to,
      promotion: ply.promotion,
    });
  }
  return game.fen();
}
