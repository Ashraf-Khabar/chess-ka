"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";

interface DeskDesktopProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  leftLabel: string;
  rightLabel: string;
  /** Persist key so analysis / catalog keep their own collapse prefs. */
  storageKey: string;
  /** Start with left open (default true). */
  defaultLeftOpen?: boolean;
  /** Start with right open (default true). */
  defaultRightOpen?: boolean;
}

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "1";
  } catch {
    return fallback;
  }
}

/**
 * Desktop three-column desk with collapsible side rails.
 * Collapsed rails shrink to an icon strip so the board can breathe.
 */
export default function DeskDesktop({
  left,
  center,
  right,
  leftLabel,
  rightLabel,
  storageKey,
  defaultLeftOpen = true,
  defaultRightOpen = true,
}: DeskDesktopProps) {
  const leftKey = `${storageKey}:left`;
  const rightKey = `${storageKey}:right`;

  const [leftOpen, setLeftOpen] = useState(defaultLeftOpen);
  const [rightOpen, setRightOpen] = useState(defaultRightOpen);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLeftOpen(readBool(leftKey, defaultLeftOpen));
    setRightOpen(readBool(rightKey, defaultRightOpen));
    setReady(true);
  }, [defaultLeftOpen, defaultRightOpen, leftKey, rightKey]);

  const toggleLeft = useCallback(() => {
    setLeftOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(leftKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [leftKey]);

  const toggleRight = useCallback(() => {
    setRightOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(rightKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [rightKey]);

  return (
    <div
      className="desk-desktop"
      data-left={leftOpen ? "open" : "closed"}
      data-right={rightOpen ? "open" : "closed"}
      data-ready={ready ? "true" : "false"}
    >
      <section
        className="desk-rail desk-rail--left"
        aria-label={leftLabel}
        data-collapsed={leftOpen ? "false" : "true"}
      >
        <button
          type="button"
          className="desk-rail-toggle"
          onClick={toggleLeft}
          aria-expanded={leftOpen}
          title={leftOpen ? `Réduire · ${leftLabel}` : `Ouvrir · ${leftLabel}`}
          aria-label={leftOpen ? `Réduire ${leftLabel}` : `Ouvrir ${leftLabel}`}
        >
          {leftOpen ? (
            <PanelLeftClose size={18} aria-hidden />
          ) : (
            <PanelLeftOpen size={18} aria-hidden />
          )}
        </button>
        <div className="desk-rail-body">{left}</div>
      </section>

      <section className="desk-stage fade-rise">{center}</section>

      <section
        className="desk-rail desk-rail--right"
        aria-label={rightLabel}
        data-collapsed={rightOpen ? "false" : "true"}
      >
        <button
          type="button"
          className="desk-rail-toggle desk-rail-toggle--right"
          onClick={toggleRight}
          aria-expanded={rightOpen}
          title={rightOpen ? `Réduire · ${rightLabel}` : `Ouvrir · ${rightLabel}`}
          aria-label={
            rightOpen ? `Réduire ${rightLabel}` : `Ouvrir ${rightLabel}`
          }
        >
          {rightOpen ? (
            <PanelRightClose size={18} aria-hidden />
          ) : (
            <PanelRightOpen size={18} aria-hidden />
          )}
        </button>
        <div className="desk-rail-body">{right}</div>
      </section>
    </div>
  );
}
