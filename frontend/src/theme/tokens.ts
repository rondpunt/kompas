// Junie Design System v5 — ChatGPT-witte basis + volledige Junie merkintegratie + dark mode
import { Platform } from "react-native";

/* ── Canvas & Lagen (LIGHT) ── */
export const LAYERS = {
  canvas: "#FFFFFF",
  sidebar: "#F5F5F5",
  sidebarHover: "#EBEBEB",
  card: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceHover: "#F9FAFB",
  interactiveHover: "#F9FAFB",
  interactivePressed: "#F3F4F6",
  modalOverlay: "rgba(0,0,0,0.4)",
} as const;

/* ── Canvas & Lagen (DARK) ── */
export const LAYERS_DARK = {
  canvas: "#111111",
  sidebar: "#1A1A1A",
  sidebarHover: "#252525",
  card: "#1A1A1A",
  surface: "#1A1A1A",
  surfaceHover: "#222222",
  interactiveHover: "#222222",
  interactivePressed: "#2A2A2A",
  modalOverlay: "rgba(0,0,0,0.6)",
} as const;

/* ── Tekst & Borders (LIGHT) ── */
export const TEXT = {
  primary: "#111111",
  secondary: "#6B7280",
  tertiary: "#9CA3AF",
  faint: "#9CA3AF",
  inverse: "#FFFFFF",
  placeholder: "#9CA3AF",
} as const;

export const TEXT_DARK = {
  primary: "#F5F5F5",
  secondary: "#A3A3A3",
  tertiary: "#737373",
  faint: "#525252",
  inverse: "#111111",
  placeholder: "#737373",
} as const;

export const BORDER = {
  subtle: "#E5E7EB",
  default: "#E5E7EB",
  medium: "#D1D5DB",
  strong: "#9CA3AF",
  topHighlight: "rgba(0,0,0,0.04)",
} as const;

export const BORDER_DARK = {
  subtle: "#2A2A2A",
  default: "#333333",
  medium: "#404040",
  strong: "#525252",
  topHighlight: "rgba(255,255,255,0.04)",
} as const;

/* ── Junie merkkleuren (5 primaire kleuren) ── */
export const BRAND = {
  blue: "#4A90E2",
  blueLight: "#5BA3F0",
  blueHover: "#6BACF5",
  blueDark: "#3A7FCC",
  blueAlpha08: "rgba(74,144,226,0.08)",
  blueAlpha15: "rgba(74,144,226,0.15)",
  blueAlpha25: "rgba(74,144,226,0.25)",
  blueAlpha35: "rgba(74,144,226,0.35)",

  green: "#7ED957",
  greenAlpha15: "rgba(126,217,87,0.15)",
  greenAlpha25: "rgba(126,217,87,0.25)",

  yellow: "#F5C84B",
  yellowAlpha15: "rgba(245,200,75,0.15)",

  orange: "#F39C4D",
  orangeAlpha15: "rgba(243,156,77,0.15)",

  coral: "#E85A5A",
  coralAlpha15: "rgba(232,90,90,0.15)",
  coralAlpha25: "rgba(232,90,90,0.25)",
} as const;

/* Multi-color Junie gradient */
export const JUNIE_GRADIENT: readonly string[] = [BRAND.blue, BRAND.green, BRAND.yellow, BRAND.orange, BRAND.coral];

/* ── Status kleuren ── */
export const STATUS = {
  successBg: "#ECFDF5",
  successBorder: BRAND.green,
  successText: "#047857",
  warningBg: "#FEF3C7",
  warningBorder: BRAND.orange,
  warningText: "#92400E",
  dangerBg: "#FEF2F2",
  dangerBorder: "#EF4444",
  dangerText: "#991B1B",
  infoBg: "#EFF6FF",
  infoBorder: BRAND.blue,
  infoText: "#1E40AF",
} as const;

/* ── Border radii ── */
export const RADII = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999,
} as const;

/* ── Spacing (4px grid) ── */
export const SPACING = {
  "1": 4, "2": 8, "3": 12, "4": 16, "5": 20,
  "6": 24, "8": 32, "10": 40, "12": 48, "16": 64,
} as const;

/* ── Schaduwsysteem ── */
export const shadow = (level: "xs" | "sm" | "md" | "lg" | "xl", color: string = "#000") => {
  const map = {
    xs: { opacity: 0.05, radius: 2, offsetY: 1, elevation: 1 },
    sm: { opacity: 0.08, radius: 6, offsetY: 2, elevation: 2 },
    md: { opacity: 0.10, radius: 12, offsetY: 4, elevation: 4 },
    lg: { opacity: 0.14, radius: 24, offsetY: 10, elevation: 8 },
    xl: { opacity: 0.20, radius: 40, offsetY: 16, elevation: 14 },
  };
  const c = map[level];
  return Platform.select({
    ios: { shadowColor: color, shadowOpacity: c.opacity, shadowRadius: c.radius, shadowOffset: { width: 0, height: c.offsetY } },
    android: { elevation: c.elevation },
    default: {},
  }) as object;
};

export const glowBlue = (intensity: "soft" | "strong" = "soft") =>
  Platform.select({
    ios: {
      shadowColor: BRAND.blue,
      shadowOpacity: intensity === "soft" ? 0.25 : 0.40,
      shadowRadius: intensity === "soft" ? 14 : 22,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: intensity === "soft" ? 3 : 7 },
    default: {},
  }) as object;

/* ── Typografie ── */
export const FONTS = {
  brand: Platform.select({ ios: "Nunito", android: "sans-serif", default: "system-ui" }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: "system-ui" }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
} as const;

export const TYPE = {
  display: { fontSize: 36, lineHeight: 40, fontWeight: "800" as const, letterSpacing: -0.8 },
  h1: { fontSize: 28, lineHeight: 32, fontWeight: "700" as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: "500" as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: "700" as const, letterSpacing: 0.5 },
};

export const MOTION = { fast: 150, base: 200, moderate: 300, slow: 500 } as const;

/* ── Palette alias (light) ── */
export const PALETTE = {
  background: LAYERS.canvas,
  surfaceElevated: LAYERS.sidebar,
  surfaceHigher: LAYERS.card,
  borderSubtle: BORDER.subtle,
  borderDefault: BORDER.default,
  borderEmphasis: BORDER.medium,
  textPrimary: TEXT.primary,
  textSecondary: TEXT.secondary,
  textMuted: TEXT.secondary,
  textFaint: TEXT.tertiary,
  accent: BRAND.blue,
  accentSoft: BRAND.blueAlpha08,
  accentSoft15: BRAND.blueAlpha15,
  success: BRAND.green,
  successBg: STATUS.successBg,
  warning: BRAND.orange,
  danger: STATUS.dangerBorder,
  dangerBg: STATUS.dangerBg,
  inversePrimary: TEXT.inverse,
} as const;

/* ── Palette alias (dark) ── */
export const PALETTE_DARK = {
  background: LAYERS_DARK.canvas,
  surfaceElevated: LAYERS_DARK.sidebar,
  surfaceHigher: LAYERS_DARK.card,
  borderSubtle: BORDER_DARK.subtle,
  borderDefault: BORDER_DARK.default,
  borderEmphasis: BORDER_DARK.medium,
  textPrimary: TEXT_DARK.primary,
  textSecondary: TEXT_DARK.secondary,
  textMuted: TEXT_DARK.secondary,
  textFaint: TEXT_DARK.tertiary,
  accent: BRAND.blue,
  accentSoft: BRAND.blueAlpha15,
  accentSoft15: BRAND.blueAlpha25,
  success: BRAND.green,
  successBg: "#022C22",
  warning: BRAND.orange,
  danger: STATUS.dangerBorder,
  dangerBg: "#2D0000",
  inversePrimary: TEXT_DARK.inverse,
} as const;
