"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Main content region — desk stage vs immersive analyze viewport.
 */
export default function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAnalyze = Boolean(pathname?.startsWith("/analyze"));

  return (
    <main className={isAnalyze ? "analyze-main" : "studio-shell"}>
      {children}
    </main>
  );
}
