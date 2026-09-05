"use client";

import type { ReactNode } from "react";
import { SettingsProvider } from "@/features/settings/context/SettingsContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
