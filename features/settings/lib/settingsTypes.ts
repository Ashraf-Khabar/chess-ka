import type { BoardTheme } from "@/features/chessboard/lib/boardThemes";
import type { PieceStyle } from "@/features/chessboard/lib/pieceSets";

export type AppLanguage = "fr" | "en";
export type BoardSize = "sm" | "md" | "lg" | "xl";
export type { BoardTheme } from "@/features/chessboard/lib/boardThemes";
export type { PieceStyle } from "@/features/chessboard/lib/pieceSets";

export type AppTheme =
  | "signal"
  | "carbon"
  | "harbor"
  | "night"
  | "emerald"
  | "slate"
  | "dusk"
  | "paper";

export type AnimationSpeed = "fast" | "normal" | "smooth";

export interface AppSettings {
  language: AppLanguage;
  boardSize: BoardSize;
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  appTheme: AppTheme;
  animationSpeed: AnimationSpeed;
  engineDepth: number;
  showLiveBestArrow: boolean;
  showNotation: boolean;
  showMoveMarkers: boolean;
  showCoachPanel: boolean;
}

export const SETTINGS_COOKIE = "cpa-settings-v5";

export const DEFAULT_SETTINGS: AppSettings = {
  language: "fr",
  boardSize: "lg",
  boardTheme: "classic",
  pieceStyle: "classic",
  appTheme: "signal",
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
  "dusk",
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
  slate: "slate",
  marble: "harbor",
  harbor: "harbor",
  ember: "dusk",
  arena: "night",
  night: "night",
  emerald: "emerald",
  dusk: "dusk",
  paper: "paper",
};

const BOARD_THEME_SET = new Set<string>([
  "classic",
  "forest",
  "walnut",
  "maple",
  "cherry",
  "ice",
  "ocean",
  "midnight",
  "graphite",
  "coral",
  "sand",
  "emerald",
  "lavender",
  "contrast",
]);

const PIECE_STYLE_SET = new Set<string>([
  "classic",
  "mono",
  "warm",
  "cool",
  "ink",
  "alpha",
]);

export function parseSettings(raw: string | null): AppSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings> & {
      appTheme?: string;
      boardTheme?: string;
      pieceStyle?: string;
      fontPair?: string;
    };
    const next: AppSettings = {
      ...DEFAULT_SETTINGS,
      language: parsed.language ?? DEFAULT_SETTINGS.language,
      boardSize: parsed.boardSize ?? DEFAULT_SETTINGS.boardSize,
      animationSpeed: parsed.animationSpeed ?? DEFAULT_SETTINGS.animationSpeed,
      engineDepth: parsed.engineDepth ?? DEFAULT_SETTINGS.engineDepth,
      showLiveBestArrow:
        parsed.showLiveBestArrow ?? DEFAULT_SETTINGS.showLiveBestArrow,
      showNotation: parsed.showNotation ?? DEFAULT_SETTINGS.showNotation,
      showMoveMarkers:
        parsed.showMoveMarkers ?? DEFAULT_SETTINGS.showMoveMarkers,
      showCoachPanel: parsed.showCoachPanel ?? DEFAULT_SETTINGS.showCoachPanel,
      appTheme:
        LEGACY_THEME[parsed.appTheme ?? ""] ?? DEFAULT_SETTINGS.appTheme,
      boardTheme: BOARD_THEME_SET.has(parsed.boardTheme ?? "")
        ? (parsed.boardTheme as BoardTheme)
        : DEFAULT_SETTINGS.boardTheme,
      pieceStyle: PIECE_STYLE_SET.has(parsed.pieceStyle ?? "")
        ? (parsed.pieceStyle as PieceStyle)
        : DEFAULT_SETTINGS.pieceStyle,
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
  root.dataset.font = "desk";
  const scheme = DARK_APP_THEMES.has(settings.appTheme) ? "dark" : "light";
  root.dataset.colorScheme = scheme;
  root.style.colorScheme = scheme;
  root.classList.toggle("dark", scheme === "dark");
}
