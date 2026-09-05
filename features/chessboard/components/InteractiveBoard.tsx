"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  Chessboard,
  type Arrow,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import { Chess, type Square } from "chess.js";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  FlipHorizontal2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Undo2,
} from "lucide-react";
import type { UseChessGameResult } from "@/features/chessboard/hooks/useChessGame";
import type { MoveQuality } from "@/features/analysis/lib/classifyMove";
import {
  LAST_MOVE_HIGHLIGHT,
  LIVE_BEST_ARROW_COLOR,
  SUGGESTION_ARROW_COLOR,
  isSuboptimalQuality,
  parseUciSquares,
} from "@/features/analysis/lib/boardAnnotations";
import {
  MoveQualityMarker,
  useSettledMoveMarker,
} from "@/features/chessboard/components/MoveQualityMarker";
import {
  BookMoveMarker,
  SquareClassifyLoader,
} from "@/features/chessboard/components/BoardSquareOverlays";
import { isBookPly } from "@/features/openings/lib/openingBook";
import { useSettings } from "@/features/settings/context/SettingsContext";
import {
  ANIMATION_MS,
  BOARD_SIZE_MAX,
  type BoardSize,
  type BoardTheme,
} from "@/features/settings/lib/settingsTypes";

const BOARD_SIZE_ORDER: BoardSize[] = ["sm", "md", "lg", "xl"];

const THEMES: Record<
  BoardTheme,
  { dark: CSSProperties; light: CSSProperties }
> = {
  forest: {
    dark: {
      backgroundColor: "#4a6b4a",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.06), transparent 42%), linear-gradient(0deg, rgba(0,0,0,.12), transparent 55%)",
    },
    light: {
      backgroundColor: "#e8edc8",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.35), transparent 45%), linear-gradient(0deg, rgba(80,90,40,.06), transparent 50%)",
    },
  },
  classic: {
    dark: {
      backgroundColor: "#779556",
      backgroundImage:
        "linear-gradient(160deg, rgba(255,255,255,.08), transparent 50%)",
    },
    light: {
      backgroundColor: "#ebecd0",
      backgroundImage:
        "linear-gradient(160deg, rgba(255,255,255,.4), transparent 50%)",
    },
  },
  walnut: {
    dark: {
      backgroundColor: "#8b5a3c",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.07), transparent 45%), linear-gradient(0deg, rgba(0,0,0,.18), transparent 55%)",
    },
    light: {
      backgroundColor: "#f0d9b5",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.4), transparent 45%)",
    },
  },
  ice: {
    dark: {
      backgroundColor: "#4a6d8c",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.1), transparent 45%)",
    },
    light: {
      backgroundColor: "#dbe7f3",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.45), transparent 50%)",
    },
  },
  midnight: {
    dark: {
      backgroundColor: "#2f3b55",
      backgroundImage:
        "linear-gradient(160deg, rgba(255,255,255,.08), transparent 50%)",
    },
    light: {
      backgroundColor: "#c9d2e3",
      backgroundImage:
        "linear-gradient(160deg, rgba(255,255,255,.35), transparent 50%)",
    },
  },
  coral: {
    dark: {
      backgroundColor: "#b15a4a",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.08), transparent 45%)",
    },
    light: {
      backgroundColor: "#f3dfd2",
      backgroundImage:
        "linear-gradient(145deg, rgba(255,255,255,.4), transparent 50%)",
    },
  },
};

interface InteractiveBoardProps {
  game: UseChessGameResult;
  moveQuality?: MoveQuality | null;
  /** Ply the quality belongs to — must match current ply to show marker. */
  markerPly?: number | null;
  /** True while the classifier is still searching. */
  isClassifying?: boolean;
  suggestedBestUci?: string | null;
  liveBestUci?: string | null;
  showLiveBestArrow?: boolean;
  /** Fill parent height (used by fullscreen review). */
  fillContainer?: boolean;
  /** Hide size +/- controls. */
  hideSizeControls?: boolean;
  /** Whose side starts at the bottom (review: analyzing player). */
  initialOrientation?: "white" | "black";
}

function InteractiveBoardComponent({
  game,
  moveQuality = null,
  markerPly = null,
  isClassifying = false,
  suggestedBestUci = null,
  liveBestUci = null,
  showLiveBestArrow = true,
  fillContainer = false,
  hideSizeControls = false,
  initialOrientation = "white",
}: InteractiveBoardProps) {
  const { settings, updateSettings, t } = useSettings();
  const {
    fen,
    lastMove,
    makeMove,
    goBack,
    goForward,
    goStart,
    goEnd,
    canGoBack,
    canGoForward,
    reset,
    history,
    plyIndex,
    isOnVariation,
    returnToFork,
  } = game;

  const [orientation, setOrientation] = useState<"white" | "black">(
    initialOrientation
  );

  useEffect(() => {
    setOrientation(initialOrientation);
  }, [initialOrientation]);

  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<
    Record<string, CSSProperties>
  >({});

  const boardSize = settings.boardSize;
  const animationMs = ANIMATION_MS[settings.animationSpeed];
  const theme = THEMES[settings.boardTheme] ?? THEMES.forest;
  const boardId = fillContainer ? "review-board" : "analysis-board";

  const clearSelection = useCallback(() => {
    setMoveFrom(null);
    setOptionSquares({});
  }, []);

  // Clear click-to-move hints when the position changes (keeps drag fluid)
  useEffect(() => {
    setMoveFrom(null);
    setOptionSquares({});
  }, [fen]);

  const showMoveOptions = useCallback(
    (square: Square): boolean => {
      const temp = new Chess(fen);
      const moves = temp.moves({ square, verbose: true });
      if (moves.length === 0) {
        clearSelection();
        return false;
      }

      const styles: Record<string, CSSProperties> = {};
      for (const move of moves) {
        const isCapture = Boolean(temp.get(move.to));
        styles[move.to] = {
          background: isCapture
            ? "radial-gradient(circle, rgba(56,189,248,.28) 82%, transparent 86%)"
            : "radial-gradient(circle, rgba(56,189,248,.42) 18%, transparent 20%)",
        };
      }
      styles[square] = {
        background:
          "linear-gradient(135deg, rgba(56,189,248,.45), rgba(61,214,140,.28))",
      };
      setOptionSquares(styles);
      setMoveFrom(square);
      return true;
    },
    [clearSelection, fen]
  );

  const tryMove = useCallback(
    (from: Square, to: Square): boolean => {
      const ok = makeMove(from, to);
      clearSelection();
      return ok;
    },
    [clearSelection, makeMove]
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      return tryMove(sourceSquare as Square, targetSquare as Square);
    },
    [tryMove]
  );

  const onSquareClick = useCallback(
    ({ square, piece }: SquareHandlerArgs) => {
      const sq = square as Square;
      if (!moveFrom) {
        if (piece) showMoveOptions(sq);
        return;
      }
      if (moveFrom === sq) {
        clearSelection();
        return;
      }
      const moved = tryMove(moveFrom, sq);
      if (!moved && piece) showMoveOptions(sq);
    },
    [clearSelection, moveFrom, showMoveOptions, tryMove]
  );

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = { ...optionSquares };
    // Always yellow wash for the last played move (quality is shown via marker)
    if (lastMove) {
      styles[lastMove.from] = {
        ...(styles[lastMove.from] ?? {}),
        background: LAST_MOVE_HIGHLIGHT.from,
      };
      styles[lastMove.to] = {
        ...(styles[lastMove.to] ?? {}),
        background: LAST_MOVE_HIGHLIGHT.to,
      };
    }
    return styles;
  }, [lastMove, optionSquares]);

  const arrows = useMemo((): Arrow[] => {
    const list: Arrow[] = [];
    const inBook = isBookPly(history, plyIndex);

    const playedUci = lastMove
      ? `${lastMove.from}${lastMove.to}${lastMove.promotion ?? ""}`
      : null;
    const correction =
      !inBook &&
      isSuboptimalQuality(moveQuality) &&
      suggestedBestUci &&
      suggestedBestUci !== playedUci
        ? parseUciSquares(suggestedBestUci)
        : null;

    // Red arrow: the move you should have played instead
    if (correction) {
      list.push({
        startSquare: correction.from,
        endSquare: correction.to,
        color: SUGGESTION_ARROW_COLOR,
      });
    }

    // Blue live-best only when we're not already showing a correction
    if (
      !correction &&
      showLiveBestArrow &&
      settings.showLiveBestArrow &&
      liveBestUci
    ) {
      const live = parseUciSquares(liveBestUci);
      if (live) {
        list.push({
          startSquare: live.from,
          endSquare: live.to,
          color: LIVE_BEST_ARROW_COLOR,
        });
      }
    }
    return list;
  }, [
    history,
    lastMove,
    liveBestUci,
    moveQuality,
    plyIndex,
    settings.showLiveBestArrow,
    showLiveBestArrow,
    suggestedBestUci,
  ]);

  // Only show marker when quality is synced to the current ply
  const bookMove =
    settings.showMoveMarkers && isBookPly(history, plyIndex);

  const syncedQuality =
    !bookMove &&
    moveQuality != null &&
    lastMove != null &&
    (markerPly === null || markerPly === plyIndex)
      ? moveQuality
      : null;

  const settledMarker = useSettledMoveMarker(
    isClassifying ? null : syncedQuality,
    lastMove?.to ?? null,
    plyIndex,
    settings.showMoveMarkers && !bookMove
  );

  // Stay on loader until the badge is ready (classifying + settle) — no gap
  const showLoader =
    settings.showMoveMarkers &&
    !bookMove &&
    lastMove != null &&
    !settledMarker &&
    (isClassifying || syncedQuality != null);

  const boardSquareStyles = useMemo(() => {
    if (!showLoader || !lastMove) return squareStyles;
    return {
      ...squareStyles,
      [lastMove.to]: {
        ...(squareStyles[lastMove.to] ?? {}),
        filter: "blur(2.5px) saturate(0.7)",
        transition: "filter 160ms ease",
      },
    };
  }, [lastMove, showLoader, squareStyles]);

  const bumpSize = (direction: 1 | -1) => {
    const index = BOARD_SIZE_ORDER.indexOf(boardSize);
    const next = BOARD_SIZE_ORDER[index + direction];
    if (next) updateSettings({ boardSize: next });
  };

  const boardOptions = {
    id: boardId,
    position: fen,
    boardOrientation: orientation,
    onPieceDrop,
    onSquareClick,
    squareStyles: boardSquareStyles,
    arrows,
    allowDrawingArrows: true,
    clearArrowsOnClick: true,
    clearArrowsOnPositionChange: true,
    showAnimations: true,
    animationDurationInMs: animationMs,
    showNotation: settings.showNotation,
    darkSquareStyle: theme.dark,
    lightSquareStyle: theme.light,
    boardStyle: {
      width: "100%",
      height: "100%",
      borderRadius: "6px",
      overflow: "hidden",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,.25)",
    },
    arrowOptions: {
      colors: {
        default: SUGGESTION_ARROW_COLOR,
        shift: LIVE_BEST_ARROW_COLOR,
        ctrl: "rgba(255, 120, 80, 0.85)",
        alt: "rgba(180, 140, 255, 0.85)",
        meta: SUGGESTION_ARROW_COLOR,
      },
      arrowLengthReducerDenominator: 7,
      sameTargetArrowLengthReducerDenominator: 4,
      arrowWidthDenominator: 5.5,
      activeArrowWidthMultiplier: 1.1,
      opacity: 0.88,
      activeOpacity: 0.96,
      arrowStartOffset: 0.15,
    },
  };

  const markerOverlay =
    bookMove && lastMove ? (
      <BookMoveMarker
        square={lastMove.to}
        orientation={orientation}
        token={plyIndex}
      />
    ) : showLoader && lastMove ? (
      <SquareClassifyLoader square={lastMove.to} orientation={orientation} />
    ) : settledMarker ? (
      <MoveQualityMarker
        quality={settledMarker.quality}
        square={settledMarker.square}
        orientation={orientation}
        token={settledMarker.token}
      />
    ) : null;

  const controls = (
    <div className="board-controls flex flex-wrap items-center justify-center gap-1.5">
      <NavButton label={t("board.start")} onClick={goStart} disabled={!canGoBack}>
        <ChevronFirst size={16} />
      </NavButton>
      <NavButton label={t("board.back")} onClick={goBack} disabled={!canGoBack}>
        <ChevronLeft size={16} />
      </NavButton>
      <span className="min-w-[4rem] text-center font-mono text-[11px] text-[var(--ink-muted)]">
        {plyIndex + 1}/{history.length || 0}
      </span>
      <NavButton
        label={t("board.forward")}
        onClick={goForward}
        disabled={!canGoForward}
      >
        <ChevronRight size={16} />
      </NavButton>
      <NavButton label={t("board.end")} onClick={goEnd} disabled={!canGoForward}>
        <ChevronLast size={16} />
      </NavButton>
      <div className="mx-1 h-5 w-px bg-[var(--line)]" />
      <NavButton
        label={t("board.flip")}
        onClick={() =>
          setOrientation((prev) => (prev === "white" ? "black" : "white"))
        }
      >
        <FlipHorizontal2 size={16} />
      </NavButton>
      {isOnVariation && (
        <NavButton
          label={t("board.returnFork")}
          onClick={returnToFork}
          emphasize
        >
          <Undo2 size={16} />
        </NavButton>
      )}
      {!fillContainer && (
        <NavButton label={t("board.reset")} onClick={reset}>
          <RotateCcw size={16} />
        </NavButton>
      )}
    </div>
  );

  if (fillContainer) {
    return (
      <div className="board-fill-root">
        <div className="board-fill-stage">
          <div className="board-fill-square board-frame board-frame-rich relative">
            <div className="board-bevel" aria-hidden />
            <div className="board-stage relative h-full w-full">
              <Chessboard options={boardOptions} />
              {markerOverlay}
            </div>
          </div>
        </div>
        {controls}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {!hideSizeControls && (
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-xs font-medium text-[var(--ink-muted)]">
            {t("studio.size")} ·{" "}
            <span className="uppercase text-[var(--accent)]">{boardSize}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <NavButton
              label={t("board.shrink")}
              onClick={() => bumpSize(-1)}
              disabled={boardSize === "sm"}
            >
              <Minimize2 size={16} />
            </NavButton>
            <NavButton
              label={t("board.grow")}
              onClick={() => bumpSize(1)}
              disabled={boardSize === "xl"}
            >
              <Maximize2 size={16} />
            </NavButton>
          </div>
        </div>
      )}

      <div
        className={`board-frame board-frame-rich relative mx-auto w-full board-size-${boardSize}`}
        style={{ maxWidth: BOARD_SIZE_MAX[boardSize] }}
      >
        <div className="board-bevel" aria-hidden />
        <div className="board-stage relative aspect-square w-full">
          <Chessboard options={boardOptions} />
          {markerOverlay}
        </div>
      </div>

      {controls}
    </div>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  label,
  emphasize = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  emphasize?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center justify-center gap-1 rounded-md border transition disabled:cursor-not-allowed disabled:opacity-35 ${
        emphasize
          ? "w-auto px-2.5 border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)]"
          : "w-9 border-[var(--line)] bg-[var(--surface-elevated)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {children}
      {emphasize && (
        <span className="hidden text-[10px] font-bold uppercase tracking-wide sm:inline">
          {label}
        </span>
      )}
    </button>
  );
}

const InteractiveBoard = memo(InteractiveBoardComponent);
export default InteractiveBoard;
