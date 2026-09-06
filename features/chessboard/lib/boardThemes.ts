import type { CSSProperties } from "react";

/**
 * Board square looks — solid colors + CSS motifs (grain, felt, marble…).
 */
export type BoardTheme =
  | "classic"
  | "forest"
  | "walnut"
  | "maple"
  | "cherry"
  | "ice"
  | "ocean"
  | "midnight"
  | "graphite"
  | "coral"
  | "sand"
  | "emerald"
  | "lavender"
  | "contrast";

export const BOARD_THEME_OPTIONS: {
  value: BoardTheme;
  swatchDark: string;
  swatchLight: string;
}[] = [
  { value: "classic", swatchDark: "#779556", swatchLight: "#ebecd0" },
  { value: "forest", swatchDark: "#4a6b4a", swatchLight: "#e8edc8" },
  { value: "walnut", swatchDark: "#8b5a3c", swatchLight: "#f0d9b5" },
  { value: "maple", swatchDark: "#b07a45", swatchLight: "#f3e0c2" },
  { value: "cherry", swatchDark: "#8f3d3d", swatchLight: "#f0d4c8" },
  { value: "ice", swatchDark: "#4a6d8c", swatchLight: "#dbe7f3" },
  { value: "ocean", swatchDark: "#2f6f7a", swatchLight: "#d5ecef" },
  { value: "midnight", swatchDark: "#2f3b55", swatchLight: "#c9d2e3" },
  { value: "graphite", swatchDark: "#4a4f57", swatchLight: "#d8dce2" },
  { value: "coral", swatchDark: "#b15a4a", swatchLight: "#f3dfd2" },
  { value: "sand", swatchDark: "#c2a15a", swatchLight: "#f4ead0" },
  { value: "emerald", swatchDark: "#1f6b4f", swatchLight: "#d8efe4" },
  { value: "lavender", swatchDark: "#6b5b8a", swatchLight: "#e8e2f2" },
  { value: "contrast", swatchDark: "#1a1a1a", swatchLight: "#f2f2f2" },
];

type SquarePair = { dark: CSSProperties; light: CSSProperties };

const grain = (alpha: number) =>
  `repeating-linear-gradient(90deg, rgba(0,0,0,${alpha}) 0 1px, transparent 1px 3px)`;

const diagonal = (alpha: number) =>
  `repeating-linear-gradient(-32deg, rgba(255,255,255,${alpha}) 0 2px, transparent 2px 7px)`;

const felt = (base: string) =>
  `radial-gradient(circle at 30% 20%, rgba(255,255,255,.12), transparent 45%), ${base}`;

export const BOARD_THEMES: Record<BoardTheme, SquarePair> = {
  classic: {
    dark: {
      backgroundColor: "#779556",
      backgroundImage:
        "linear-gradient(160deg, rgba(255,255,255,.08), transparent 50%)",
    },
    light: {
      backgroundColor: "#ebecd0",
      backgroundImage:
        "linear-gradient(160deg, rgba(255,255,255,.4), transparent 50%)",
    },
  },
  forest: {
    dark: {
      backgroundColor: "#4a6b4a",
      backgroundImage: `${diagonal(0.06)}, linear-gradient(145deg, rgba(255,255,255,.06), transparent 42%)`,
    },
    light: {
      backgroundColor: "#e8edc8",
      backgroundImage: `${diagonal(0.05)}, linear-gradient(145deg, rgba(255,255,255,.35), transparent 45%)`,
    },
  },
  walnut: {
    dark: {
      backgroundColor: "#8b5a3c",
      backgroundImage: `${grain(0.08)}, linear-gradient(145deg, rgba(255,255,255,.07), transparent 45%)`,
    },
    light: {
      backgroundColor: "#f0d9b5",
      backgroundImage: `${grain(0.05)}, linear-gradient(145deg, rgba(255,255,255,.4), transparent 45%)`,
    },
  },
  maple: {
    dark: {
      backgroundColor: "#b07a45",
      backgroundImage: `${grain(0.1)}, linear-gradient(180deg, rgba(0,0,0,.08), transparent 55%)`,
    },
    light: {
      backgroundColor: "#f3e0c2",
      backgroundImage: `${grain(0.06)}, linear-gradient(180deg, rgba(255,255,255,.45), transparent 50%)`,
    },
  },
  cherry: {
    dark: {
      backgroundColor: "#8f3d3d",
      backgroundImage: `${grain(0.09)}, linear-gradient(145deg, rgba(255,255,255,.08), transparent 50%)`,
    },
    light: {
      backgroundColor: "#f0d4c8",
      backgroundImage: `${grain(0.05)}, linear-gradient(145deg, rgba(255,255,255,.35), transparent 50%)`,
    },
  },
  ice: {
    dark: {
      backgroundColor: "#4a6d8c",
      backgroundImage: `${diagonal(0.08)}, linear-gradient(145deg, rgba(255,255,255,.1), transparent 45%)`,
    },
    light: {
      backgroundColor: "#dbe7f3",
      backgroundImage: `${diagonal(0.06)}, linear-gradient(145deg, rgba(255,255,255,.45), transparent 50%)`,
    },
  },
  ocean: {
    dark: {
      backgroundColor: "#2f6f7a",
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 2px, transparent 2px 8px), linear-gradient(160deg, rgba(255,255,255,.1), transparent 50%)",
    },
    light: {
      backgroundColor: "#d5ecef",
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(47,111,122,.06) 0 2px, transparent 2px 8px), linear-gradient(160deg, rgba(255,255,255,.4), transparent 50%)",
    },
  },
  midnight: {
    dark: {
      backgroundColor: "#2f3b55",
      backgroundImage: felt("linear-gradient(160deg, rgba(255,255,255,.08), transparent 50%)"),
    },
    light: {
      backgroundColor: "#c9d2e3",
      backgroundImage: felt("linear-gradient(160deg, rgba(255,255,255,.35), transparent 50%)"),
    },
  },
  graphite: {
    dark: {
      backgroundColor: "#4a4f57",
      backgroundImage: `${grain(0.12)}, linear-gradient(145deg, rgba(255,255,255,.06), transparent 50%)`,
    },
    light: {
      backgroundColor: "#d8dce2",
      backgroundImage: `${grain(0.07)}, linear-gradient(145deg, rgba(255,255,255,.4), transparent 50%)`,
    },
  },
  coral: {
    dark: {
      backgroundColor: "#b15a4a",
      backgroundImage: `${diagonal(0.07)}, linear-gradient(145deg, rgba(255,255,255,.08), transparent 45%)`,
    },
    light: {
      backgroundColor: "#f3dfd2",
      backgroundImage: `${diagonal(0.05)}, linear-gradient(145deg, rgba(255,255,255,.4), transparent 50%)`,
    },
  },
  sand: {
    dark: {
      backgroundColor: "#c2a15a",
      backgroundImage:
        "radial-gradient(rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(160deg, rgba(255,255,255,.12), transparent 50%)",
      backgroundSize: "6px 6px, auto",
    },
    light: {
      backgroundColor: "#f4ead0",
      backgroundImage:
        "radial-gradient(rgba(0,0,0,.04) 1px, transparent 1px), linear-gradient(160deg, rgba(255,255,255,.4), transparent 50%)",
      backgroundSize: "6px 6px, auto",
    },
  },
  emerald: {
    dark: {
      backgroundColor: "#1f6b4f",
      backgroundImage: felt("linear-gradient(145deg, rgba(255,255,255,.08), transparent 45%)"),
    },
    light: {
      backgroundColor: "#d8efe4",
      backgroundImage: felt("linear-gradient(145deg, rgba(255,255,255,.4), transparent 50%)"),
    },
  },
  lavender: {
    dark: {
      backgroundColor: "#6b5b8a",
      backgroundImage: `${diagonal(0.08)}, linear-gradient(160deg, rgba(255,255,255,.1), transparent 50%)`,
    },
    light: {
      backgroundColor: "#e8e2f2",
      backgroundImage: `${diagonal(0.05)}, linear-gradient(160deg, rgba(255,255,255,.4), transparent 50%)`,
    },
  },
  contrast: {
    dark: {
      backgroundColor: "#1a1a1a",
      backgroundImage: "linear-gradient(160deg, rgba(255,255,255,.06), transparent 50%)",
    },
    light: {
      backgroundColor: "#f2f2f2",
      backgroundImage: "linear-gradient(160deg, rgba(0,0,0,.03), transparent 50%)",
    },
  },
};
