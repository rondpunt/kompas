// Junie Design System v4 — ChatGPT-witte basis met volle Junie merkintegratie.
// Single source of truth.

import { Platform } from "react-native";

/* ──────────────────────────────────────────────────────────────────────────
   Canvas & Lagen (LIGHT)
   ────────────────────────────────────────────────────────────────────────── */
export const LAYERS = {
  canvas: "#FFFFFF",          // hoofd-achtergrond
  sidebar: "#F5F5F5",         // sidebar / panelen
  sidebarHover: "#EBEBEB",
  card: "#FFFFFF",            // cards op canvas
  surface: "#FFFFFF",         // modals, dropdowns
  surfaceHover: "#F9FAFB",
  interactiveHover: "#F9FAFB",
  interactivePressed: "#F3F4F6",
  modalOverlay: "rgba(0,0,0,0.4)",
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Tekst & borders
   ────────────────────────────────────────────────────────────────────────── */
export const TEXT = {
  primary: "#111111",         // hoofd-tekst (niet puur zwart)
  secondary: "#6B7280",       // labels, metadata
  tertiary: "#9CA3AF",        // placeholders
  faint: "#9CA3AF",
  inverse: "#FFFFFF",         // tekst op gekleurde knoppen
  placeholder: "#9CA3AF",
} as const;

export const BORDER = {
  subtle: "#E5E7EB",
  default: "#E5E7EB",
  medium: "#D1D5DB",
  strong: "#9CA3AF",
  topHighlight: "rgba(0,0,0,0.04)",
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Junie merkkleuren (vijf primaire kleuren met semantische betekenis)
   ────────────────────────────────────────────────────────────────────────── */
export const BRAND = {
  blue: "#4A90E2",     // Primaire CTA, vertrouwen
  blueLight: "#5BA3F0",
  blueHover: "#6BACF5",
  blueDark: "#3A7FCC",
  blueAlpha08: "rgba(74,144,226,0.08)",
  blueAlpha15: "rgba(74,144,226,0.15)",
  blueAlpha25: "rgba(74,144,226,0.25)",
  blueAlpha35: "rgba(74,144,226,0.35)",

  green: "#7ED957",    // Succes, groei
  greenAlpha15: "rgba(126,217,87,0.15)",
  greenAlpha25: "rgba(126,217,87,0.25)",

  yellow: "#F5C84B",   // Inzichten, nieuwe info
  yellowAlpha15: "rgba(245,200,75,0.15)",

  orange: "#F39C4D",   // Energie, streaks
  orangeAlpha15: "rgba(243,156,77,0.15)",

  coral: "#E85A5A",    // Community, empathie
  coralAlpha15: "rgba(232,90,90,0.15)",
} as const;

/* Multicolor Junie gradient (woordmerk, hero, onboarding) */
export const JUNIE_GRADIENT: readonly string[] = [
  BRAND.blue,
  BRAND.green,
  BRAND.yellow,
  BRAND.orange,
  BRAND.coral,
];

/* ──────────────────────────────────────────────────────────────────────────
   Status-kleuren (semantisch, gebaseerd op merk)
   ────────────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────────────
   Border radii
   ────────────────────────────────────────────────────────────────────────── */
export const RADII = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Spacing (4px grid)
   ────────────────────────────────────────────────────────────────────────── */
export const SPACING = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Schaduwsysteem
   ────────────────────────────────────────────────────────────────────────── */
export const shadow = (
  level: "xs" | "sm" | "md" | "lg" | "xl",
  color: string = "#000",
) => {
  const map: Record<string, { opacity: number; radius: number; offsetY: number; elevation: number }> = {
    xs: { opacity: 0.05, radius: 2, offsetY: 1, elevation: 1 },
    sm: { opacity: 0.08, radius: 6, offsetY: 2, elevation: 2 },
    md: { opacity: 0.10, radius: 12, offsetY: 4, elevation: 4 },
    lg: { opacity: 0.14, radius: 24, offsetY: 10, elevation: 8 },
    xl: { opacity: 0.20, radius: 40, offsetY: 16, elevation: 14 },
  };
  const c = map[level];
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: c.opacity,
      shadowRadius: c.radius,
      shadowOffset: { width: 0, height: c.offsetY },
    },
    android: { elevation: c.elevation },
    default: {},
  }) as object;
};

export const glowBlue = (intensity: "soft" | "strong" = "soft") =>
  Platform.select({
    ios: {
      shadowColor: BRAND.blue,
      shadowOpacity: intensity === "soft" ? 0.25 : 0.35,
      shadowRadius: intensity === "soft" ? 14 : 20,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: intensity === "soft" ? 3 : 6 },
    default: {},
  }) as object;

/* ──────────────────────────────────────────────────────────────────────────
   Typografie
   ────────────────────────────────────────────────────────────────────────── */
export const FONTS = {
  brand: Platform.select({ ios: "Nunito", android: "sans-serif", default: "system-ui" }), // woordmerk, hero
  body: Platform.select({ ios: "System", android: "sans-serif", default: "system-ui" }),  // UI
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

export const MOTION = {
  fast: 150,
  base: 200,
  moderate: 300,
  slow: 500,
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Palette alias voor bestaande code (`useTheme().palette`)
   ────────────────────────────────────────────────────────────────────────── */
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
  accentSoft: BRAND.blueAlpha15,
  success: BRAND.green,
  successBg: STATUS.successBg,
  warning: BRAND.orange,
  danger: STATUS.dangerBorder,
  dangerBg: STATUS.dangerBg,
  inversePrimary: TEXT.inverse,
} as const;
