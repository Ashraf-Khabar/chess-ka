"use client";

import { Loader2, X } from "lucide-react";
import type { ChessComGame } from "@/features/analysis/api/chessCom";
import {
  formatGameEndDate,
  getGameResultLabel,
} from "@/features/analysis/api/chessCom";

interface GameListModalProps {
  isOpen: boolean;
  username: string;
  games: ChessComGame[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSelectGame: (game: ChessComGame) => void;
}

export default function GameListModal({
  isOpen,
  username,
  games,
  isLoading,
  error,
  onClose,
  onSelectGame,
}: GameListModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-list-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/45 backdrop-blur-[2px]"
        aria-label="Close game list"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_24px_60px_rgba(20,28,24,0.22)]">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div>
            <p className="eyebrow">Chess.com</p>
            <h2
              id="game-list-title"
              className="font-display text-xl text-[var(--ink)]"
            >
              Recent games
            </h2>
            {username && (
              <p className="text-sm text-[var(--ink-muted)]">{username}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-[var(--ink-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--ink-muted)]">
              <Loader2 className="animate-spin text-[var(--forest)]" size={28} />
              <p className="text-sm">Fetching games…</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && !error && games.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[var(--ink-muted)]">
              No recent standard chess games found for this player.
            </div>
          )}

          {!isLoading && !error && games.length > 0 && (
            <ul className="divide-y divide-[var(--line)]">
              {games.map((game) => {
                const result = getGameResultLabel(game, username);
                return (
                  <li key={game.uuid ?? game.url}>
                    <button
                      type="button"
                      onClick={() => onSelectGame(game)}
                      className="flex w-full flex-col gap-1 px-5 py-3.5 text-left transition hover:bg-[var(--forest-soft)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-[var(--ink)]">
                          {game.white.username}{" "}
                          <span className="font-normal text-[var(--ink-muted)]">
                            vs
                          </span>{" "}
                          {game.black.username}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-bold ${resultTone(result)}`}
                        >
                          {result}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--ink-muted)]">
                        <span className="capitalize">{game.time_class}</span>
                        <span>·</span>
                        <span>
                          {game.white.rating} / {game.black.rating}
                        </span>
                        <span>·</span>
                        <span>{formatGameEndDate(game.end_time)}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function resultTone(label: string): string {
  if (label === "Won" || label === "1-0") return "text-[var(--forest)]";
  if (label === "Lost" || label === "0-1") return "text-red-700";
  return "text-[var(--ink-muted)]";
}
