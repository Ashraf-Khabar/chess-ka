"use client";

import { useRouter } from "next/navigation";
import { Loader2, Library, ArrowUpRight } from "lucide-react";
import type { ChessComGame } from "@/features/analysis/api/chessCom";
import {
  formatGameEndDate,
  getGameResultLabel,
} from "@/features/analysis/api/chessCom";
import { useSettings } from "@/features/settings/context/SettingsContext";
import {
  getGameId,
  saveActiveGame,
} from "@/features/analysis/lib/gameSession";

interface GamesLibraryPanelProps {
  username: string;
  games: ChessComGame[];
  isLoading: boolean;
  error: string | null;
  activeGameUrl?: string | null;
}

/**
 * Persistent Chess.com game library — opens a dedicated review page per game.
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
    <aside className="panel-shell flex max-h-[min(80vh,820px)] flex-col">
      <header className="mb-3 flex items-start justify-between gap-2 border-b border-[var(--line)] pb-3">
        <div>
          <p className="eyebrow">{t("library.eyebrow")}</p>
          <h2 className="font-display text-xl text-[var(--ink)]">
            {t("library.title")}
          </h2>
          {username ? (
            <p className="mt-0.5 text-xs text-[var(--ink-muted)]">@{username}</p>
          ) : (
            <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
              {t("library.enterUser")}
            </p>
          )}
        </div>
        <Library size={18} className="text-[var(--accent)]" />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex flex-col items-center gap-2 py-12 text-[var(--ink-muted)]">
            <Loader2 className="animate-spin" size={22} />
            <p className="text-sm">{t("library.loading")}</p>
          </div>
        )}

        {!isLoading && error && (
          <p className="py-8 text-center text-sm text-red-400">{error}</p>
        )}

        {!isLoading && !error && games.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--ink-muted)]">
            {t("library.emptyHint")}
          </p>
        )}

        {!isLoading && !error && games.length > 0 && (
          <ul className="space-y-1.5">
            {games.map((gameItem) => {
              const active = activeGameUrl === gameItem.url;
              const result = getGameResultLabel(gameItem, username);

              return (
                <li key={gameItem.uuid ?? gameItem.url}>
                  <button
                    type="button"
                    onClick={() => openReview(gameItem)}
                    className={`group w-full rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[var(--ink)]">
                        {gameItem.white.username}{" "}
                        <span className="font-normal text-[var(--ink-muted)]">
                          vs
                        </span>{" "}
                        {gameItem.black.username}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[var(--accent)] opacity-80 group-hover:opacity-100">
                        <span className="text-[10px] font-bold uppercase">
                          {t("library.analyze")}
                        </span>
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--ink-muted)]">
                      <span
                        className={`font-bold ${
                          result === "Won"
                            ? "text-emerald-400"
                            : result === "Lost"
                              ? "text-red-400"
                              : ""
                        }`}
                      >
                        {result === "Won"
                          ? t("library.win")
                          : result === "Lost"
                            ? t("library.loss")
                            : t("library.draw")}
                      </span>
                      <span>·</span>
                      <span className="capitalize">{gameItem.time_class}</span>
                      <span>·</span>
                      <span>
                        {gameItem.white.rating}/{gameItem.black.rating}
                      </span>
                      <span>·</span>
                      <span suppressHydrationWarning>
                        {formatGameEndDate(gameItem.end_time)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {games.length > 0 && (
        <p className="mt-3 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--ink-muted)]">
          {t("library.loadedCount", { count: games.length })}
        </p>
      )}
    </aside>
  );
}
