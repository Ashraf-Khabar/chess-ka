"use client";

import { useRouter } from "next/navigation";
import { Loader2, ArrowUpRight } from "lucide-react";
import type { ChessComGame } from "@/features/analysis/api/chessCom";
import {
  formatGameEndDate,
  getGameResultLabel,
} from "@/features/analysis/api/chessCom";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { getGameId, saveActiveGame } from "@/features/analysis/lib/gameSession";

interface GamesLibraryPanelProps {
  username: string;
  games: ChessComGame[];
  isLoading: boolean;
  error: string | null;
  activeGameUrl?: string | null;
}

/**
 * Chess.com game library. Height is owned by the container (rail or sheet),
 * so the list scrolls inside whatever surface it is dropped into.
 */
export default function GamesLibraryPanel({
  username,
  games,
  isLoading,
  error,
  activeGameUrl = null,
}: GamesLibraryPanelProps) {
  const { t } = useSettings();
  const router = useRouter();

  const openReview = (game: ChessComGame) => {
    saveActiveGame({ username, game });
    router.push(`/analyze/${encodeURIComponent(getGameId(game))}`);
  };

  return (
    <section className="library-panel" aria-label={t("library.title")}>
      <header className="library-head">
        <div className="min-w-0">
          <p className="eyebrow">{t("library.eyebrow")}</p>
          <h2 className="font-display text-lg text-[var(--ink)]">
            {t("library.title")}
          </h2>
        </div>
        {username && <span className="chip shrink-0">@{username}</span>}
      </header>

      <div className="library-list">
        {isLoading && (
          <div className="flex flex-col items-center gap-2 py-10 text-[var(--ink-faint)]">
            <Loader2 className="animate-spin" size={20} aria-hidden />
            <p className="text-xs">{t("library.loading")}</p>
          </div>
        )}

        {!isLoading && error && (
          <p className="px-3 py-8 text-center text-sm text-[var(--eval-blunder)]">
            {error}
          </p>
        )}

        {!isLoading && !error && games.length === 0 && (
          <p className="px-3 py-10 text-center text-xs leading-relaxed text-[var(--ink-faint)]">
            {t("library.emptyHint")}
          </p>
        )}

        {!isLoading &&
          !error &&
          games.map((gameItem) => {
            const active = activeGameUrl === gameItem.url;
            const result = getGameResultLabel(gameItem, username);
            const resultTone =
              result === "Won"
                ? "text-[var(--eval-best)]"
                : result === "Lost"
                  ? "text-[var(--eval-blunder)]"
                  : "text-[var(--ink-muted)]";

            return (
              <button
                key={gameItem.uuid ?? gameItem.url}
                type="button"
                onClick={() => openReview(gameItem)}
                data-active={active ? "true" : "false"}
                className="list-row group"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-semibold text-[var(--ink)]">
                    {gameItem.white.username}
                    <span className="mx-1 font-normal text-[var(--ink-faint)]">
                      vs
                    </span>
                    {gameItem.black.username}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-[var(--ink-faint)]">
                    <span className={`font-bold uppercase ${resultTone}`}>
                      {result === "Won"
                        ? t("library.win")
                        : result === "Lost"
                          ? t("library.loss")
                          : t("library.draw")}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="capitalize">{gameItem.time_class}</span>
                    <span aria-hidden>·</span>
                    <span className="tabular-nums">
                      {gameItem.white.rating}/{gameItem.black.rating}
                    </span>
                    <span aria-hidden>·</span>
                    <span suppressHydrationWarning>
                      {formatGameEndDate(gameItem.end_time)}
                    </span>
                  </span>
                </span>
                <ArrowUpRight
                  size={15}
                  aria-hidden
                  className="shrink-0 text-[var(--ink-faint)] group-hover:text-[var(--accent)]"
                />
              </button>
            );
          })}
      </div>

      {games.length > 0 && (
        <p className="library-foot">
          {t("library.loadedCount", { count: games.length })}
        </p>
      )}
    </section>
  );
}
