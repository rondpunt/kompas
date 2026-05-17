// Onboarding design tokens — Kompas spec (Deel D)
// Separate from main app theme — night variant per spec

export const OB = {
  bg: '#0A0F1E',
  surface: '#141B2E',
  elevated: '#1E2536',
  border: '#2A3447',
  borderFocus: '#5B7FFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#B4B9C8',
  textMuted: '#6B7280',
  textFaint: '#4A5A7A',
  accent: '#5B7FFF',
  accentSoft: 'rgba(91,127,255,0.15)',
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.12)',
  danger: '#EF4444',
  white: '#FFFFFF',
} as const;

export const OBFonts = {
  serif: 'Georgia',         // Playfair Display fallback
  sans: undefined,          // System sans (DM Sans fallback)
} as const;
