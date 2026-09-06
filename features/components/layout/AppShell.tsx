"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/features/components/layout/AppSidebar";
import AppTopBar from "@/features/components/layout/AppTopBar";
import BottomTabBar from "@/features/components/layout/BottomTabBar";

/**
 * App chrome: desktop rail + mobile masthead/tab bar around the main stage.
 * /analyze is immersive — no masthead, no tab bar.
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
      <div className="app-shell-stage">
        {!isAnalyze && <AppTopBar />}
        {children}
      </div>
      <BottomTabBar />
    </div>
  );
}
