"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
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
} from "@/features/settings/lib/settingsTypes";
import { BOARD_THEMES } from "@/features/chessboard/lib/boardThemes";
import { getPieceRenderers } from "@/features/chessboard/lib/pieceSets";

const BOARD_SIZE_ORDER: BoardSize[] = ["sm", "md", "lg", "xl"];

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
  /** Edge-to-edge board (Chess.com mobile). */
  bare?: boolean;
  /** Content above the board (e.g. opponent bar). */
  topBanner?: ReactNode;
  /** Content between board and controls (e.g. player bar). */
  bottomBanner?: ReactNode;
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
  bare = false,
  topBanner = null,
  bottomBanner = null,
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

  /*
   * react-chessboard measures its container on mount. If it mounts while the
   * stage still has zero size (hidden branch, sheet transition, first paint)
   * it throws "Square width not found". Gate the mount on a real measurement.
   */
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
  const [stageReady, setStageReady] = useState(false);

  useEffect(() => {
    if (!stageEl) return;
    const measure = () => {
      const rect = stageEl.getBoundingClientRect();
      setStageReady(rect.width > 32 && rect.height > 32);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, [stageEl]);

  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<
    Record<string, CSSProperties>
  >({});

  const boardSize = settings.boardSize;
  const animationMs = ANIMATION_MS[settings.animationSpeed];
  const theme = BOARD_THEMES[settings.boardTheme] ?? BOARD_THEMES.classic;
  const pieces = useMemo(
    () => getPieceRenderers(settings.pieceStyle),
    [settings.pieceStyle]
  );
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
    pieces,
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
      borderRadius: "0",
      overflow: "hidden",
    },
    arrowOptions: {
      colors: {
        default: SUGGESTION_ARROW_COLOR,
        shift: LIVE_BEST_ARROW_COLOR,
        ctrl: "rgba(255, 120, 80, 0.85)",
        alt: "rgba(180, 140, 255, 0.85)",
        meta: SUGGESTION_ARROW_COLOR,
      },
      color: SUGGESTION_ARROW_COLOR,
      secondaryColor: LIVE_BEST_ARROW_COLOR,
      tertiaryColor: "rgba(255, 120, 80, 0.85)",
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
    <div className={`board-controls ${bare ? "board-controls--bare" : ""}`}>
      {isOnVariation && (
        <>
          <button
            type="button"
            onClick={returnToFork}
            className="variation-return-btn"
            title={t("board.returnForkHint")}
          >
            <Undo2 size={14} />
            <span>{t("board.returnFork")}</span>
          </button>
          <span className="board-divider" aria-hidden />
        </>
      )}
      <NavButton label={t("board.start")} onClick={goStart} disabled={!canGoBack}>
        <ChevronFirst size={16} />
      </NavButton>
      <NavButton label={t("board.back")} onClick={goBack} disabled={!canGoBack}>
        <ChevronLeft size={16} />
      </NavButton>
      <span className="board-ply-counter">
        {plyIndex + 1}/{history.length || 0}
        {isOnVariation ? " · var" : ""}
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
      <span className="board-divider" aria-hidden />
      <NavButton
        label={t("board.flip")}
        onClick={() =>
          setOrientation((prev) => (prev === "white" ? "black" : "white"))
        }
      >
        <FlipHorizontal2 size={16} />
      </NavButton>
      {!fillContainer && !bare && (
        <NavButton label={t("board.reset")} onClick={reset}>
          <RotateCcw size={16} />
        </NavButton>
      )}
    </div>
  );

  /* The single measured square that react-chessboard renders into. */
  const stage = (
    <div className="board-stage" ref={setStageEl}>
      {stageReady ? (
        <>
          <Chessboard options={boardOptions} />
          {markerOverlay}
        </>
      ) : (
        <div className="board-skeleton">{t("board.loading")}</div>
      )}
    </div>
  );

  // Edge-to-edge: mobile sticky board. Compact size controls still available.
  if (bare) {
    return (
      <div className="board-root board-bare">
        {!hideSizeControls && (
          <div className="board-size-bar board-size-bar--bare">
            <p className="eyebrow">
              {t("studio.size")} ·{" "}
              <span className="text-[var(--accent)]">{boardSize}</span>
            </p>
            <div className="flex items-center gap-1">
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
        {topBanner}
        <div className="board-stage-wrap">{stage}</div>
        {bottomBanner}
        {controls}
      </div>
    );
  }

  // Framed board that fills the height of its parent (desktop review pane).
  if (fillContainer) {
    return (
      <div className="board-root board-root--fill">
        {!hideSizeControls && (
          <div className="board-size-bar">
            <p className="eyebrow">
              {t("studio.size")} ·{" "}
              <span className="text-[var(--accent)]">{boardSize}</span>
            </p>
            <div className="flex items-center gap-1">
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
        {topBanner}
        <div
          className="board-stage-wrap board-frame board-frame-rich"
          style={{
            width: "100%",
            maxWidth: BOARD_SIZE_MAX[boardSize],
            marginInline: "auto",
          }}
        >
          <div className="board-bevel" aria-hidden />
          {stage}
        </div>
        {bottomBanner}
        {controls}
      </div>
    );
  }

  return (
    <div className="board-root">
      {!hideSizeControls && (
        <div className="board-size-bar">
          <p className="eyebrow">
            {t("studio.size")} ·{" "}
            <span className="text-[var(--accent)]">{boardSize}</span>
          </p>
          <div className="flex items-center gap-1">
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
        className="board-stage-wrap board-frame board-frame-rich mx-auto"
        style={{ maxWidth: BOARD_SIZE_MAX[boardSize] }}
      >
        <div className="board-bevel" aria-hidden />
        {stage}
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="board-btn"
    >
      {children}
    </button>
  );
}

const InteractiveBoard = memo(InteractiveBoardComponent);
export default InteractiveBoard;
