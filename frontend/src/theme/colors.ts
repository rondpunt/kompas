// Kompas Design Tokens — Night (default) + Klaar themes
// Per /app/design_guidelines.json

export type ThemeName = "night" | "klaar";

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
  // Inverted on primary button (e.g. text inside white button on Night)
  inversePrimary: string;
}

export const NIGHT: Palette = {
  background: "#0a0a0a",
  surfaceElevated: "#161616",
  surfaceHigher: "#1f1f1f",
  borderSubtle: "#1f1f1f",
  borderDefault: "#262626",
  borderEmphasis: "#383838",
  textPrimary: "#fafafa",
  textSecondary: "#a3a3a3",
  textMuted: "#737373",
  textFaint: "#525252",
  accent: "#f59e0b",
  accentSoft: "rgba(245, 158, 11, 0.16)",
  success: "#84cc16",
  successBg: "#1a3309",
  warning: "#FAC775",
  danger: "#ef4444",
  dangerBg: "#450a0a",
  inversePrimary: "#0a0a0a",
};

export const KLAAR: Palette = {
  background: "#ffffff",
  surfaceElevated: "#f4f4f4",
  surfaceHigher: "#ececec",
  borderSubtle: "#ececec",
  borderDefault: "#e0e0e0",
  borderEmphasis: "#c8c8c8",
  textPrimary: "#0d0d0d",
  textSecondary: "#525252",
  textMuted: "#737373",
  textFaint: "#a3a3a3",
  accent: "#d97706",
  accentSoft: "#faeeda",
  success: "#4d7c0f",
  successBg: "#ecfccb",
  warning: "#854F0B",
  danger: "#b91c1c",
  dangerBg: "#fee2e2",
  inversePrimary: "#ffffff",
};

export const palettes: Record<ThemeName, Palette> = {
  night: NIGHT,
  klaar: KLAAR,
};

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
