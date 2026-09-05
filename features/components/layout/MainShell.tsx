"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Switches main chrome: full-bleed studio vs full-viewport analyze shell.
 */
export default function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAnalyze = Boolean(pathname?.startsWith("/analyze"));

  return (
    <main
      className={
        isAnalyze
          ? "analyze-main"
          : "studio-shell w-full flex-grow"
      }
    >
      {children}
    </main>
  );
}
