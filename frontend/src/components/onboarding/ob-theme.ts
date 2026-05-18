// Onboarding design tokens — Junie v3 premium dark (mirrors main NIGHT palette)
// Single source of truth voor onboarding visuals.

export const OB = {
  bg: '#1A1A1A',
  surface: '#242424',
  elevated: '#2C2C2C',
  border: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  borderFocus: '#4A90E2',
  textPrimary: '#ECECEC',
  textSecondary: '#B8B8B8',
  textMuted: '#8E8E8E',
  textFaint: '#5E5E5E',
  accent: '#4A90E2',
  accentLight: '#5BA0F0',
  accentHover: '#6BACF5',
  accentSoft: 'rgba(74,144,226,0.15)',
  success: '#7ED957',
  successBg: 'rgba(126,217,87,0.12)',
  danger: '#E85D5D',
  white: '#FFFFFF',
  inverse: '#FFFFFF', // tekst op blauwe knoppen
} as const;

export const OBFonts = {
  serif: 'Georgia',
  sans: undefined,
} as const;
