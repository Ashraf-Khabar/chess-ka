"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query. Returns `null` until mounted so the server HTML and the
 * first client paint agree. Callers gate their layout on the non-null value,
 * which keeps the chessboard to a single mount.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
