import type { ChessComGame } from "@/features/analysis/api/chessCom";
import type { Move } from "chess.js";

/**
 * Which color the analyzing Chess.com user played in this game.
 */
export function getPerspectiveColor(
  username: string,
  game: ChessComGame
): "w" | "b" | null {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return null;
  if (game.white.username.toLowerCase() === normalized) return "w";
  if (game.black.username.toLowerCase() === normalized) return "b";
  return null;
}

/** True when the ply at `plyIndex` was played by the analyzing user. */
export function isPerspectivePly(
  history: Move[],
  plyIndex: number,
  perspectiveColor: "w" | "b" | null
): boolean {
  if (!perspectiveColor || plyIndex < 0 || plyIndex >= history.length) {
    return false;
  }
  return history[plyIndex].color === perspectiveColor;
}

export function getOpponentName(
  username: string,
  game: ChessComGame
): string {
  const color = getPerspectiveColor(username, game);
  if (color === "w") return game.black.username;
  if (color === "b") return game.white.username;
  return "opponent";
}
