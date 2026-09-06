export type AppLanguage = "fr" | "en";
export type BoardSize = "sm" | "md" | "lg" | "xl";
export type BoardTheme =
  | "forest"
  | "classic"
  | "walnut"
  | "ice"
  | "midnight"
  | "coral";
export type AppTheme = "signal" | "carbon" | "harbor" | "night";
export type FontPair = "desk" | "manrope" | "grotesk";
export type AnimationSpeed = "fast" | "normal" | "smooth";

export interface AppSettings {
  language: AppLanguage;
  boardSize: BoardSize;
  boardTheme: BoardTheme;
  appTheme: AppTheme;
  fontPair: FontPair;
  animationSpeed: AnimationSpeed;
  engineDepth: number;
  showLiveBestArrow: boolean;
  showNotation: boolean;
  showMoveMarkers: boolean;
  showCoachPanel: boolean;
}

export const SETTINGS_COOKIE = "cpa-settings-v4";

export const DEFAULT_SETTINGS: AppSettings = {
  language: "fr",
  boardSize: "lg",
  boardTheme: "classic",
  appTheme: "signal",
  fontPair: "desk",
  animationSpeed: "normal",
  engineDepth: 14,
  showLiveBestArrow: true,
  showNotation: true,
  showMoveMarkers: true,
  showCoachPanel: true,
};

export const DARK_APP_THEMES: ReadonlySet<AppTheme> = new Set([
  "carbon",
  "night",
]);

export const ANIMATION_MS: Record<AnimationSpeed, number> = {
  fast: 180,
  normal: 280,
  smooth: 380,
};

export const BOARD_SIZE_MAX: Record<BoardSize, string> = {
  sm: "min(100%, 440px)",
  md: "min(100%, 560px)",
  lg: "min(100%, 700px)",
  xl: "min(100%, min(86vh, 860px))",
};

export const ENGINE_DEPTH_OPTIONS = [10, 12, 14, 16, 18] as const;

/** Public GitHub repo used for support / stars / issues. */
export const GITHUB_REPO_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ??
  "https://github.com/khaba/chess_ka";

const LEGACY_THEME: Record<string, AppTheme> = {
  forest: "signal",
  atelier: "signal",
  signal: "signal",
  midnight: "carbon",
  ink: "carbon",
  carbon: "carbon",
  slate: "harbor",
  marble: "harbor",
  harbor: "harbor",
  ember: "night",
  arena: "night",
  night: "night",
};

const LEGACY_FONT: Record<string, FontPair> = {
  sora: "desk",
  studio: "desk",
  desk: "desk",
  manrope: "manrope",
  grotesk: "grotesk",
};

export function parseSettings(raw: string | null): AppSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings> & {
      appTheme?: string;
      fontPair?: string;
    };
    const next: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      appTheme:
        LEGACY_THEME[parsed.appTheme ?? ""] ?? DEFAULT_SETTINGS.appTheme,
      fontPair:
        LEGACY_FONT[parsed.fontPair ?? ""] ?? DEFAULT_SETTINGS.fontPair,
    };
    if (
      !ENGINE_DEPTH_OPTIONS.includes(
        next.engineDepth as (typeof ENGINE_DEPTH_OPTIONS)[number]
      )
    ) {
      next.engineDepth = DEFAULT_SETTINGS.engineDepth;
    }
    return next;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function applyDocumentSettings(settings: AppSettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = settings.language;
  root.dataset.appTheme = settings.appTheme;
  root.dataset.font = settings.fontPair;
  const scheme = DARK_APP_THEMES.has(settings.appTheme) ? "dark" : "light";
  root.dataset.colorScheme = scheme;
  root.style.colorScheme = scheme;
  root.classList.toggle("dark", scheme === "dark");
}
