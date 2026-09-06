"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/features/components/layout/AppSidebar";
import BottomTabBar from "@/features/components/layout/BottomTabBar";

/**
 * App chrome: desktop sidebar + mobile bottom tabs + main stage.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAnalyze = Boolean(pathname?.startsWith("/analyze"));

  return (
    <div
      className={`app-shell ${isAnalyze ? "app-shell--analyze" : ""}`}
      data-analyze={isAnalyze ? "true" : "false"}
    >
      <AppSidebar />
      <div className="app-shell-stage">{children}</div>
      <BottomTabBar />
    </div>
  );
}
