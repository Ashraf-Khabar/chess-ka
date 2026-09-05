"use client";

import type { Move } from "chess.js";
import { Fragment } from "react";
import {
  MOVE_QUALITY_LABEL,
  type MoveQuality,
} from "@/features/analysis/lib/classifyMove";
import { useSettings } from "@/features/settings/context/SettingsContext";

interface MoveListProps {
  history: Move[];
  plyIndex: number;
  onSelectPly: (ply: number) => void;
  /** Full main game — shown with optional nested variation. */
  mainLine?: Move[];
  forkPly?: number | null;
  variation?: Move[];
  isOnVariation?: boolean;
  /** Jump to a main-line ply (exits the variation). */
  onSelectMainPly?: (ply: number) => void;
  currentQuality?: MoveQuality | null;
  compact?: boolean;
}

export default function MoveList({
  history,
  plyIndex,
  onSelectPly,
  mainLine,
  forkPly = null,
  variation = [],
  isOnVariation = false,
  onSelectMainPly,
  currentQuality = null,
  compact = false,
}: MoveListProps) {
  const { t } = useSettings();
  const baseLine = mainLine ?? history;
  const showTree = Boolean(mainLine && forkPly !== null && variation.length > 0);

  if (baseLine.length === 0 && variation.length === 0) {
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

  for (let i = 0; i < baseLine.length; i += 2) {
    rows.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: baseLine[i],
      black: baseLine[i + 1],
      whitePly: i,
      blackPly: i + 1,
    });
  }

  const selectMain = (ply: number) => {
    if (isOnVariation && onSelectMainPly) {
      onSelectMainPly(ply);
      return;
    }
    onSelectPly(ply);
  };

  const selectVariation = (varIndex: number) => {
    if (forkPly === null) return;
    // Active history index for this variation move
    onSelectPly(forkPly + 1 + varIndex);
  };

  const forkInsertAfterRow = forkPly !== null && forkPly >= 0
    ? Math.floor(forkPly / 2)
    : -1;

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
          {showTree && forkPly === -1 && (
            <tr className="border-b border-[var(--line)]">
              <td colSpan={3} className="px-2 py-1.5">
                <VariationBranch
                  forkPly={-1}
                  variation={variation}
                  plyIndex={plyIndex}
                  currentQuality={currentQuality}
                  label={t("moves.variation")}
                  onSelect={selectVariation}
                />
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <Fragment key={`main-${row.moveNumber}`}>
              <tr className="border-b border-[var(--line)] last:border-0">
                <td className="w-10 px-3 py-1.5 font-mono text-xs text-[var(--ink-muted)]">
                  {row.moveNumber}.
                </td>
                <td className="px-1 py-1">
                  {row.white && (
                    <PlyButton
                      san={row.white.san}
                      active={
                        !isOnVariation
                          ? plyIndex === row.whitePly
                          : plyIndex === row.whitePly &&
                            plyIndex <= (forkPly ?? -1)
                      }
                      muted={
                        isOnVariation && row.whitePly > (forkPly ?? -1)
                      }
                      quality={
                        !isOnVariation && plyIndex === row.whitePly
                          ? currentQuality
                          : null
                      }
                      onClick={() => selectMain(row.whitePly)}
                    />
                  )}
                </td>
                <td className="px-1 py-1">
                  {row.black && (
                    <PlyButton
                      san={row.black.san}
                      active={
                        !isOnVariation
                          ? plyIndex === row.blackPly
                          : plyIndex === row.blackPly &&
                            plyIndex <= (forkPly ?? -1)
                      }
                      muted={
                        isOnVariation && row.blackPly > (forkPly ?? -1)
                      }
                      quality={
                        !isOnVariation && plyIndex === row.blackPly
                          ? currentQuality
                          : null
                      }
                      onClick={() => selectMain(row.blackPly)}
                    />
                  )}
                </td>
              </tr>
              {showTree && forkInsertAfterRow === row.moveNumber - 1 && (
                <tr className="border-b border-[var(--line)]">
                  <td colSpan={3} className="px-2 py-1.5">
                    <VariationBranch
                      forkPly={forkPly!}
                      variation={variation}
                      plyIndex={plyIndex}
                      currentQuality={currentQuality}
                      label={t("moves.variation")}
                      onSelect={selectVariation}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VariationBranch({
  forkPly,
  variation,
  plyIndex,
  currentQuality,
  label,
  onSelect,
}: {
  forkPly: number;
  variation: Move[];
  plyIndex: number;
  currentQuality: MoveQuality | null;
  label: string;
  onSelect: (varIndex: number) => void;
}) {
  // First variation move number / side depends on forkPly
  const startPly = forkPly + 1;

  return (
    <div className="move-variation">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {variation.map((move, index) => {
          const absolutePly = startPly + index;
          const moveNumber = Math.floor(absolutePly / 2) + 1;
          const isWhite = absolutePly % 2 === 0;
          const active = plyIndex === absolutePly;
          const showNumber = index === 0 || isWhite;

          return (
            <span key={`v-${index}`} className="inline-flex items-center gap-0.5">
              {showNumber && (
                <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                  {moveNumber}
                  {isWhite ? "." : "..."}
                </span>
              )}
              <PlyButton
                san={move.san}
                active={active}
                quality={active ? currentQuality : null}
                onClick={() => onSelect(index)}
                compact
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PlyButton({
  san,
  active,
  quality,
  onClick,
  muted = false,
  compact = false,
}: {
  san: string;
  active: boolean;
  quality: MoveQuality | null;
  onClick: () => void;
  muted?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-between gap-1 rounded text-left font-medium transition ${
        compact ? "px-1.5 py-0.5 text-xs" : "w-full px-2 py-1"
      } ${
        active
          ? "bg-[var(--accent)] text-[var(--on-accent)]"
          : muted
            ? "text-[var(--ink-muted)] opacity-55 hover:opacity-90 hover:bg-[var(--accent-soft)]"
            : "text-[var(--ink)] hover:bg-[var(--accent-soft)]"
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
