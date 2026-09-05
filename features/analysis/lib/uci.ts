import { Chess } from "chess.js";

/**
 * Converts a UCI move (e.g. "e2e4" or "e7e8q") to SAN for the given FEN.
 */
export function uciToSan(fen: string, uci: string | null): string | null {
  if (!uci || uci.length < 4) return null;

  try {
    const game = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion =
      uci.length > 4 ? uci[4]?.toLowerCase() : undefined;
    const move = game.move({
      from,
      to,
      ...(promotion ? { promotion } : {}),
    });
    return move?.san ?? null;
  } catch {
    return null;
  }
}
