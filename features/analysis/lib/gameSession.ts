import type { ChessComGame } from "@/features/analysis/api/chessCom";

const ACTIVE_GAME_KEY = "cpa-active-game-v1";
export const LIBRARY_STORAGE_KEY = "cpa-chesscom-games-v1";

export interface ActiveGameSession {
  username: string;
  game: ChessComGame;
}

export interface StoredLibrary {
  username: string;
  games: ChessComGame[];
}

/** Stable id for routing — prefers Chess.com uuid, else URL tail. */
export function getGameId(game: ChessComGame): string {
  if (game.uuid && game.uuid.length > 0) return game.uuid;
  const tail = game.url.split("/").filter(Boolean).pop();
  return tail ?? `game-${game.end_time}`;
}

export function saveActiveGame(session: ActiveGameSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(session));
}

export function loadActiveGame(): ActiveGameSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_GAME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveGameSession;
  } catch {
    return null;
  }
}

export function findGameInLibrary(gameId: string): ActiveGameSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return null;
    const library = JSON.parse(raw) as StoredLibrary;
    const game = library.games.find((g) => getGameId(g) === gameId);
    if (!game) return null;
    return { username: library.username, game };
  } catch {
    return null;
  }
}

export function saveLibrary(library: StoredLibrary): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
}

export function loadLibrary(): StoredLibrary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLibrary;
  } catch {
    return null;
  }
}
