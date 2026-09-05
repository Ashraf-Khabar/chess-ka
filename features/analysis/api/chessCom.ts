/**
 * Typed Chess.com Published Data API client.
 *
 * Flow for recent games:
 * 1. GET /player/{username}/games/archives → list of monthly archive URLs
 * 2. Fetch the newest archive(s) → arrays of finished games with PGN
 *
 * Prefer calling this from a Next.js Route Handler so we can set a proper
 * User-Agent and avoid browser CORS limitations.
 */

const CHESS_COM_API_BASE = "https://api.chess.com/pub";

/** Application identity required by Chess.com's published-data API. */
const USER_AGENT = "ChessProAnalyzer/1.0 (https://github.com/chess-pro-analyzer)";

// ---------------------------------------------------------------------------
// Response types (strictly matching Chess.com's published schema)
// ---------------------------------------------------------------------------

export interface ChessComPlayerSide {
  username: string;
  rating: number;
  result: string;
  "@id": string;
  uuid?: string;
}

export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  fen: string;
  time_class: string;
  rules: string;
  white: ChessComPlayerSide;
  black: ChessComPlayerSide;
  eco?: string;
  accuracies?: {
    white: number;
    black: number;
  };
  tcn?: string;
  uuid?: string;
  initial_setup?: string;
  tournament?: string;
  match?: string;
}

interface GameArchivesResponse {
  archives: string[];
}

interface MonthlyGamesResponse {
  games: ChessComGame[];
}

export class ChessComApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ChessComApiError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Low-level fetch helper
// ---------------------------------------------------------------------------

async function chessComFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    // Always pull fresh data when the user explicitly fetches games
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new ChessComApiError("Player not found on Chess.com.", 404);
  }

  if (response.status === 429) {
    throw new ChessComApiError(
      "Chess.com rate limit reached. Please try again shortly.",
      429
    );
  }

  if (!response.ok) {
    throw new ChessComApiError(
      `Chess.com API request failed (${response.status}).`,
      response.status
    );
  }

  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns monthly archive URLs for a player, oldest → newest.
 */
export async function fetchPlayerArchives(
  username: string
): Promise<string[]> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) {
    throw new ChessComApiError("Username is required.", 400);
  }

  const data = await chessComFetch<GameArchivesResponse>(
    `${CHESS_COM_API_BASE}/player/${encodeURIComponent(normalized)}/games/archives`
  );

  return data.archives;
}

/**
 * Fetches all finished games from a single monthly archive URL.
 */
export async function fetchMonthlyGames(
  archiveUrl: string
): Promise<ChessComGame[]> {
  const data = await chessComFetch<MonthlyGamesResponse>(archiveUrl);
  return data.games;
}

export interface FetchRecentGamesOptions {
  /** How many of the newest monthly archives to pull (default: 1). */
  monthsToFetch?: number;
  /** Max games to return after sorting by end_time desc (default: 25). */
  limit?: number;
}

/**
 * Fetches a player's most recent finished games.
 *
 * Walks archives from newest → oldest until `limit` games are collected
 * (or archives run out). Only standard chess games are included.
 */
export async function fetchRecentGames(
  username: string,
  options: FetchRecentGamesOptions = {}
): Promise<ChessComGame[]> {
  const { monthsToFetch = 1, limit = 25 } = options;

  const archives = await fetchPlayerArchives(username);

  if (archives.length === 0) {
    return [];
  }

  // Archives arrive oldest-first; reverse so we start with the latest month
  const newestFirst = [...archives].reverse().slice(0, monthsToFetch);
  const collected: ChessComGame[] = [];

  for (const archiveUrl of newestFirst) {
    const monthlyGames = await fetchMonthlyGames(archiveUrl);

    // Prefer standard chess over variants (chess960, bughouse, etc.)
    const standardGames = monthlyGames.filter(
      (game) => game.rules === "chess" && Boolean(game.pgn)
    );

    collected.push(...standardGames);

    if (collected.length >= limit) {
      break;
    }
  }

  // Newest games first for the UI list
  return collected
    .sort((a, b) => b.end_time - a.end_time)
    .slice(0, limit);
}

/**
 * Lightweight display helpers derived from a Chess.com game object.
 */
export function getGameResultLabel(
  game: ChessComGame,
  perspectiveUsername?: string
): string {
  if (!perspectiveUsername) {
    const whiteWon = game.white.result === "win";
    const blackWon = game.black.result === "win";
    if (whiteWon) return "1-0";
    if (blackWon) return "0-1";
    return "½-½";
  }

  const normalized = perspectiveUsername.toLowerCase();
  const isWhite =
    game.white.username.toLowerCase() === normalized;
  const side = isWhite ? game.white : game.black;
  const opponent = isWhite ? game.black : game.white;

  if (side.result === "win") return "Won";
  if (opponent.result === "win") return "Lost";
  return "Draw";
}

export function formatGameEndDate(endTimeUnix: number): string {
  return new Date(endTimeUnix * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
