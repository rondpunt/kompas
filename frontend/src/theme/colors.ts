// Junie v4 — Light/ChatGPT-witte basis.
// Single light palette (dark mode is optional toekomst, niet actief).

export type ThemeName = "night";

export interface Palette {
  background: string;
  surfaceElevated: string;
  surfaceHigher: string;
  borderSubtle: string;
  borderDefault: string;
  borderEmphasis: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  success: string;
  successBg: string;
  warning: string;
  danger: string;
  dangerBg: string;
  inversePrimary: string;
}

export const NIGHT: Palette = {
  background: "#FFFFFF",
  surfaceElevated: "#F5F5F5",
  surfaceHigher: "#FFFFFF",
  borderSubtle: "#E5E7EB",
  borderDefault: "#E5E7EB",
  borderEmphasis: "#D1D5DB",
  textPrimary: "#111111",
  textSecondary: "#6B7280",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  accent: "#4A90E2",
  accentSoft: "rgba(74,144,226,0.15)",
  success: "#7ED957",
  successBg: "#ECFDF5",
  warning: "#F39C4D",
  danger: "#EF4444",
  dangerBg: "#FEF2F2",
  inversePrimary: "#FFFFFF",
};

export const KLAAR: Palette = NIGHT;
export const palettes = { night: NIGHT } as const;
