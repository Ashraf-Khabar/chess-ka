import { NextRequest, NextResponse } from "next/server";
import {
  ChessComApiError,
  fetchRecentGames,
} from "@/features/analysis/api/chessCom";

/**
 * GET /api/chess-com/games?username=hikaru&limit=25&months=1
 *
 * Proxies Chess.com so the browser never hits CORS / User-Agent issues.
 */
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  const limitParam = request.nextUrl.searchParams.get("limit");
  const monthsParam = request.nextUrl.searchParams.get("months");

  if (!username || username.trim().length === 0) {
    return NextResponse.json(
      { error: "Query parameter 'username' is required." },
      { status: 400 }
    );
  }

  const limit = clampInt(limitParam, 25, 1, 100);
  const monthsToFetch = clampInt(monthsParam, 1, 1, 3);

  try {
    const games = await fetchRecentGames(username, {
      limit,
      monthsToFetch,
    });

    return NextResponse.json({ games, username: username.trim() });
  } catch (error) {
    if (error instanceof ChessComApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("[chess-com/games]", error);
    return NextResponse.json(
      { error: "Unexpected error while fetching Chess.com games." },
      { status: 500 }
    );
  }
}

function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
