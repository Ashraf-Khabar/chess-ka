"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";

export interface AnalysisSheetTab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface AnalysisSheetProps {
  tabs: AnalysisSheetTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  /** Small live readout shown in the grip (usually the engine eval). */
  peek?: ReactNode;
  /** True on /analyze, where there is no bottom tab bar to clear. */
  immersive?: boolean;
}

/** Resting heights as a fraction of the viewport, smallest first. */
const SNAP_POINTS = [0.22, 0.52, 0.84] as const;
const TAP_SLOP_PX = 6;

/**
 * Match Desk sheet — a rigid, snap-height panel docked under the sticky board.
 * Drag the grip to resize, tap it to cycle through the snap points.
 */
export default function AnalysisSheet({
  tabs,
  activeTab,
  onTabChange,
  peek = null,
  immersive = false,
}: AnalysisSheetProps) {
  const { t } = useSettings();
  const sheetRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{
    startY: number;
    startHeight: number;
    moved: boolean;
  } | null>(null);

  const [snapIndex, setSnapIndex] = useState(0);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const cycleSnap = useCallback(() => {
    setSnapIndex((prev) => (prev + 1) % SNAP_POINTS.length);
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent) => {
    const sheet = sheetRef.current;
    if (!sheet || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startY: event.clientY,
      startHeight: sheet.getBoundingClientRect().height,
      moved: false,
    };
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = drag.startY - event.clientY;
    if (Math.abs(delta) > TAP_SLOP_PX) drag.moved = true;
    if (!drag.moved) return;
    const viewport = window.innerHeight;
    const next = Math.min(
      viewport * SNAP_POINTS[SNAP_POINTS.length - 1],
      Math.max(viewport * 0.14, drag.startHeight + delta)
    );
    setDragHeight(next);
  }, []);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (!drag.moved) {
        setDragHeight(null);
        cycleSnap();
        return;
      }

      const fraction =
        (dragHeight ?? drag.startHeight) / Math.max(1, window.innerHeight);
      let nearest = 0;
      SNAP_POINTS.forEach((point, index) => {
        if (
          Math.abs(point - fraction) < Math.abs(SNAP_POINTS[nearest] - fraction)
        ) {
          nearest = index;
        }
      });
      setSnapIndex(nearest);
      setDragHeight(null);
    },
    [cycleSnap, dragHeight]
  );

  const isExpanded = snapIndex === SNAP_POINTS.length - 1;
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section
      ref={sheetRef}
      aria-label={t("sheet.title")}
      className={`sheet ${immersive ? "sheet--immersive" : ""} ${
        dragHeight !== null ? "sheet--dragging" : ""
      }`}
      style={
        {
          "--sheet-h":
            dragHeight !== null
              ? `${dragHeight}px`
              : `${SNAP_POINTS[snapIndex] * 100}dvh`,
        } as CSSProperties
      }
    >
      <div
        className="sheet-grip"
        role="separator"
        aria-orientation="horizontal"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="sheet-grip-inner">
          <span className="eyebrow">{t("desk.eyebrow")}</span>
          <span className="sheet-grip-bar" aria-hidden />
          <span className="flex items-center gap-2">
            {peek ? (
              <span className="font-display text-base leading-none text-[var(--ink)] tabular-nums">
                {peek}
              </span>
            ) : null}
            <button
              type="button"
              aria-label={isExpanded ? t("sheet.collapse") : t("sheet.expand")}
              onClick={cycleSnap}
              className="inline-grid h-11 w-8 place-items-center text-[var(--ink-muted)]"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </span>
        </span>
      </div>

      <div className="sheet-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active?.id}
            data-active={tab.id === active?.id}
            onClick={() => onTabChange(tab.id)}
            className="sheet-tab"
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="sheet-body" role="tabpanel">
        {active?.content}
      </div>
    </section>
  );
}
