"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Main content region — studio scroll vs immersive analyze viewport.
 */
export default function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAnalyze = Boolean(pathname?.startsWith("/analyze"));

  return (
    <main
      className={
        isAnalyze ? "analyze-main" : "studio-shell w-full flex-grow"
      }
    >
      {children}
    </main>
  );
}
