"use client";

import type { Move } from "chess.js";
import {
  MOVE_QUALITY_LABEL,
  type MoveQuality,
} from "@/features/analysis/lib/classifyMove";
import { useSettings } from "@/features/settings/context/SettingsContext";

interface MoveListProps {
  history: Move[];
  plyIndex: number;
  onSelectPly: (ply: number) => void;
  currentQuality?: MoveQuality | null;
  compact?: boolean;
}

export default function MoveList({
  history,
  plyIndex,
  onSelectPly,
  currentQuality = null,
  compact = false,
}: MoveListProps) {
  const { t } = useSettings();

  if (history.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-[var(--ink-muted)]">
        {t("moves.empty")}
      </p>
    );
  }

  const rows: {
    moveNumber: number;
    white?: Move;
    black?: Move;
    whitePly: number;
    blackPly: number;
  }[] = [];

  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
      whitePly: i,
      blackPly: i + 1,
    });
  }

  return (
    <div
      className={
        compact
          ? "h-full max-h-full overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]"
          : "max-h-56 overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]"
      }
    >
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.moveNumber}
              className="border-b border-[var(--line)] last:border-0"
            >
              <td className="w-10 px-3 py-1.5 font-mono text-xs text-[var(--ink-muted)]">
                {row.moveNumber}.
              </td>
              <td className="px-1 py-1">
                {row.white && (
                  <PlyButton
                    san={row.white.san}
                    active={plyIndex === row.whitePly}
                    quality={plyIndex === row.whitePly ? currentQuality : null}
                    onClick={() => onSelectPly(row.whitePly)}
                  />
                )}
              </td>
              <td className="px-1 py-1">
                {row.black && (
                  <PlyButton
                    san={row.black.san}
                    active={plyIndex === row.blackPly}
                    quality={plyIndex === row.blackPly ? currentQuality : null}
                    onClick={() => onSelectPly(row.blackPly)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlyButton({
  san,
  active,
  quality,
  onClick,
}: {
  san: string;
  active: boolean;
  quality: MoveQuality | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-1 rounded px-2 py-1 text-left font-medium transition ${
        active
          ? "bg-[var(--forest)] text-[var(--cream)]"
          : "text-[var(--ink)] hover:bg-[var(--forest-soft)]"
      }`}
    >
      <span>{san}</span>
      {quality && active && (
        <span
          className={`quality-badge quality-${quality} scale-90`}
          title={MOVE_QUALITY_LABEL[quality]}
        >
          {MOVE_QUALITY_LABEL[quality].slice(0, 1)}
        </span>
      )}
    </button>
  );
}
