// Junie Design System v3 — Premium Dark
// Single source of truth voor alle UI tokens.
// Doctrine: Soft-tactile minimalism. Lagen, geen vlakken. Niets schreeuwt.

import { Platform } from "react-native";

/* ──────────────────────────────────────────────────────────────────────────
   Lagensysteem (Layer 0..4)
   Elk element zit op een hoogtelaag t.o.v. de canvas-achtergrond.
   ────────────────────────────────────────────────────────────────────────── */
export const LAYERS = {
  canvas: "#1A1A1A",           // L0 — app-achtergrond
  panel: "#141414",            // L1 — sidebar / panelen (dieper, ingebed)
  card: "#242424",             // L2 — cards, inputs, modals
  cardGradientTop: "#262626",  // L2 subtle gradient top (premium feel)
  cardGradientBottom: "#222222",
  popover: "#2C2C2C",          // L3 — dropdowns, tooltips
  chatInput: "#2A2A2A",        // chat-input verheven oppervlak
  modalOverlay: "rgba(0,0,0,0.55)", // backdrop achter modal (mag blur hebben)
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Tekst & borders
   ────────────────────────────────────────────────────────────────────────── */
export const TEXT = {
  primary: "#ECECEC",
  secondary: "#B8B8B8",
  muted: "#8E8E8E",
  faint: "#5E5E5E",
  placeholder: "#7E7E7E",
  inverse: "#0F0F0F", // tekst op kleurrijke knoppen
} as const;

export const BORDER = {
  subtle: "rgba(255,255,255,0.05)",
  default: "rgba(255,255,255,0.08)",
  hover: "rgba(255,255,255,0.12)",
  emphasis: "rgba(255,255,255,0.16)",
  topHighlight: "rgba(255,255,255,0.06)", // inner highlight bovenaan L2/L3
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Kleurensysteem — Junie multicolor brand
   ────────────────────────────────────────────────────────────────────────── */
export const BRAND = {
  blue: "#4A90E2",       // Primair CTA
  blueLight: "#5BA0F0",  // Hover top stop
  blueHover: "#6BACF5",
  blueDark: "#3A7BC8",
  blueAlpha10: "rgba(74,144,226,0.10)",
  blueAlpha15: "rgba(74,144,226,0.15)",
  blueAlpha20: "rgba(74,144,226,0.20)",
  blueAlpha30: "rgba(74,144,226,0.30)",
  green: "#7ED957",
  yellow: "#F5C84B",
  orange: "#F39C4D",
  red: "#E85D5D",
} as const;

/* Multicolor CTA gradient (max één per scherm) */
export const RAINBOW_GRADIENT: readonly string[] = [
  "#4A90E2",
  "#7ED957",
  "#F5C84B",
  "#F39C4D",
] as const;

/* ──────────────────────────────────────────────────────────────────────────
   Status-kleuren (alleen voor feedback)
   ────────────────────────────────────────────────────────────────────────── */
export const STATUS = {
  success: "#7ED957",
  successBg: "rgba(126,217,87,0.12)",
  warning: "#F5C84B",
  warningBg: "rgba(245,200,75,0.12)",
  danger: "#E85D5D",
  dangerBg: "rgba(232,93,93,0.12)",
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Border radii (vaste schaal — gebruik nooit afwijkende waarden)
   ────────────────────────────────────────────────────────────────────────── */
export const RADII = {
  xs: 8,    // pills, badges, tags
  sm: 10,   // kleine inputs
  md: 14,   // knoppen, dropdowns, menu-items
  lg: 18,   // cards, kleine modals
  xl: 24,   // chat-input, grote modals, bubbles
  pill: 999,
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Spacing (4px grid)
   ────────────────────────────────────────────────────────────────────────── */
export const SPACING = {
  px: 1,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
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
   Schaduwsysteem (4 niveaus, altijd 2-laags)
   React Native: gebruik shadowColor/shadowOpacity/shadowRadius/shadowOffset
   ────────────────────────────────────────────────────────────────────────── */
export const shadow = (
  level: "xs" | "sm" | "md" | "lg" | "xl",
  color: string = "#000",
) => {
  const map: Record<string, { opacity: number; radius: number; offsetY: number; elevation: number }> = {
    xs: { opacity: 0.20, radius: 2, offsetY: 1, elevation: 1 },
    sm: { opacity: 0.30, radius: 12, offsetY: 4, elevation: 2 },
    md: { opacity: 0.35, radius: 24, offsetY: 12, elevation: 6 },
    lg: { opacity: 0.40, radius: 48, offsetY: 24, elevation: 10 },
    xl: { opacity: 0.50, radius: 80, offsetY: 32, elevation: 18 },
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

/* Gekleurde glow (voor CTA-knoppen) */
export const glowBlue = (intensity: "soft" | "strong" = "soft") =>
  Platform.select({
    ios: {
      shadowColor: BRAND.blue,
      shadowOpacity: intensity === "soft" ? 0.35 : 0.5,
      shadowRadius: intensity === "soft" ? 16 : 28,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: intensity === "soft" ? 4 : 8 },
    default: {},
  }) as object;

/* ──────────────────────────────────────────────────────────────────────────
   Typografie
   ────────────────────────────────────────────────────────────────────────── */
export const FONTS = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "Menlo" }),
} as const;

export const TYPE = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "500" as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "500" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: "500" as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  caption: { fontSize: 11.5, lineHeight: 16, fontWeight: "500" as const, letterSpacing: 0.3 },
  overline: { fontSize: 10.5, lineHeight: 14, fontWeight: "700" as const, letterSpacing: 0.6 },
};

/* ──────────────────────────────────────────────────────────────────────────
   Motion (timings)
   ────────────────────────────────────────────────────────────────────────── */
export const MOTION = {
  fast: 150,
  base: 200,
  modal: 250,
  drawer: 280,
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   Aliased palette voor compatibiliteit met bestaande code (Palette interface)
   ────────────────────────────────────────────────────────────────────────── */
export const PALETTE = {
  background: LAYERS.canvas,
  surfaceElevated: LAYERS.card,
  surfaceHigher: LAYERS.popover,
  borderSubtle: BORDER.subtle,
  borderDefault: BORDER.default,
  borderEmphasis: BORDER.emphasis,
  textPrimary: TEXT.primary,
  textSecondary: TEXT.secondary,
  textMuted: TEXT.muted,
  textFaint: TEXT.faint,
  accent: BRAND.blue,
  accentSoft: BRAND.blueAlpha15,
  success: STATUS.success,
  successBg: STATUS.successBg,
  warning: STATUS.warning,
  danger: STATUS.danger,
  dangerBg: STATUS.dangerBg,
  inversePrimary: TEXT.inverse,
} as const;
