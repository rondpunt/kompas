// Junie v3 — Premium dark tokens. Single dark palette (no light variant).
// Per /app/frontend/src/theme/tokens.ts.

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
  background: "#1A1A1A",
  surfaceElevated: "#242424",
  surfaceHigher: "#2C2C2C",
  borderSubtle: "rgba(255,255,255,0.05)",
  borderDefault: "rgba(255,255,255,0.08)",
  borderEmphasis: "rgba(255,255,255,0.16)",
  textPrimary: "#ECECEC",
  textSecondary: "#B8B8B8",
  textMuted: "#8E8E8E",
  textFaint: "#5E5E5E",
  accent: "#4A90E2",
  accentSoft: "rgba(74,144,226,0.15)",
  success: "#7ED957",
  successBg: "rgba(126,217,87,0.12)",
  warning: "#F5C84B",
  danger: "#E85D5D",
  dangerBg: "rgba(232,93,93,0.12)",
  inversePrimary: "#FFFFFF",
};

// KLAAR removed — Junie v3 is dark-only.
// Keep alias for legacy imports.
export const KLAAR: Palette = NIGHT;
export const palettes = { night: NIGHT } as const;

// Category-icon tints (mapped to backgrounds). 800-900 hex stops for night, 50-100 for klaar.
export interface CategoryStyle {
  iconName: string; // lucide / feather / material name
  iconLib: "Feather" | "MaterialCommunityIcons";
  bgNight: string;
  fgNight: string;
  bgKlaar: string;
  fgKlaar: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  stemming: {
    iconName: "cloud-rain",
    iconLib: "Feather",
    bgNight: "#451a03",
    fgNight: "#fcd34d",
    bgKlaar: "#fef3c7",
    fgKlaar: "#92400e",
  },
  angst: {
    iconName: "wind",
    iconLib: "Feather",
    bgNight: "#1e3a8a",
    fgNight: "#93c5fd",
    bgKlaar: "#dbeafe",
    fgKlaar: "#1e40af",
  },
  adhd: {
    iconName: "zap",
    iconLib: "Feather",
    bgNight: "#581c87",
    fgNight: "#d8b4fe",
    bgKlaar: "#f3e8ff",
    fgKlaar: "#6b21a8",
  },
  autisme: {
    iconName: "layers",
    iconLib: "Feather",
    bgNight: "#134e4a",
    fgNight: "#5eead4",
    bgKlaar: "#ccfbf1",
    fgKlaar: "#0f766e",
  },
  borderline: {
    iconName: "waves",
    iconLib: "MaterialCommunityIcons",
    bgNight: "#831843",
    fgNight: "#f9a8d4",
    bgKlaar: "#fce7f3",
    fgKlaar: "#9d174d",
  },
  trauma: {
    iconName: "shield",
    iconLib: "Feather",
    bgNight: "#7c2d12",
    fgNight: "#fdba74",
    bgKlaar: "#ffedd5",
    fgKlaar: "#9a3412",
  },
  ocd: {
    iconName: "refresh-cw",
    iconLib: "Feather",
    bgNight: "#1f2937",
    fgNight: "#d1d5db",
    bgKlaar: "#f3f4f6",
    fgKlaar: "#374151",
  },
  eten: {
    iconName: "food-apple-outline",
    iconLib: "MaterialCommunityIcons",
    bgNight: "#14532d",
    fgNight: "#86efac",
    bgKlaar: "#dcfce7",
    fgKlaar: "#15803d",
  },
  verslaving: {
    iconName: "glass-wine",
    iconLib: "MaterialCommunityIcons",
    bgNight: "#7f1d1d",
    fgNight: "#fca5a5",
    bgKlaar: "#fee2e2",
    fgKlaar: "#991b1b",
  },
  sociaal: {
    iconName: "users",
    iconLib: "Feather",
    bgNight: "#1e40af",
    fgNight: "#bfdbfe",
    bgKlaar: "#dbeafe",
    fgKlaar: "#1e40af",
  },
  welzijn: {
    iconName: "sun",
    iconLib: "Feather",
    bgNight: "#92400e",
    fgNight: "#fcd34d",
    bgKlaar: "#fef3c7",
    fgKlaar: "#92400e",
  },
  persoonlijkheid: {
    iconName: "heart",
    iconLib: "Feather",
    bgNight: "#6b21a8",
    fgNight: "#e9d5ff",
    bgKlaar: "#f3e8ff",
    fgKlaar: "#6b21a8",
  },
};

export const CATEGORY_LABELS: Record<string, string> = {
  stemming: "Stemming",
  angst: "Angst",
  adhd: "ADHD",
  autisme: "Autisme",
  borderline: "Borderline",
  trauma: "Trauma",
  ocd: "OCD",
  eten: "Eten",
  verslaving: "Verslaving",
  sociaal: "Sociaal",
  welzijn: "Welzijn",
  persoonlijkheid: "Persoonlijkheid",
};
