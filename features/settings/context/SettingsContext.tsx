"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCookie, setCookie } from "@/features/settings/lib/cookies";
import {
  DEFAULT_SETTINGS,
  LEGACY_SETTINGS_COOKIES,
  SETTINGS_COOKIE,
  parseSettings,
  applyDocumentSettings,
  type AppSettings,
} from "@/features/settings/lib/settingsTypes";
import {
  translate,
  type TranslationKey,
} from "@/features/settings/lib/i18n";

interface SettingsContextValue {
  settings: AppSettings;
  hydrated: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Always start from defaults so SSR HTML matches the first client paint.
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const current = getCookie(SETTINGS_COOKIE);
    let raw = current;
    for (const legacy of LEGACY_SETTINGS_COOKIES) {
      if (raw) break;
      raw = getCookie(legacy);
    }
    const fromCookie = parseSettings(raw);
    setSettings(fromCookie);
    setHydrated(true);
    applyDocumentSettings(fromCookie);
    // Migrate legacy cookies (and legacy theme names) onto the current key.
    if (!current) {
      setCookie(SETTINGS_COOKIE, JSON.stringify(fromCookie));
    }
  }, []);

  const persist = useCallback((next: AppSettings) => {
    setCookie(SETTINGS_COOKIE, JSON.stringify(next));
    applyDocumentSettings(next);
    setSettings(next);
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setCookie(SETTINGS_COOKIE, JSON.stringify(next));
      applyDocumentSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    persist({ ...DEFAULT_SETTINGS });
  }, [persist]);

  // Before hydration, always translate with defaults to avoid SSR/client drift.
  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(
        hydrated ? settings.language : DEFAULT_SETTINGS.language,
        key,
        vars
      ),
    [hydrated, settings.language]
  );

  const value = useMemo(
    () => ({
      settings: hydrated ? settings : DEFAULT_SETTINGS,
      hydrated,
      updateSettings,
      resetSettings,
      t,
    }),
    [hydrated, resetSettings, settings, t, updateSettings]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
