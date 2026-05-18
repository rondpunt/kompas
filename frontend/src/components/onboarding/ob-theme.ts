// Onboarding design tokens — Junie warm-dark premium (matches main NIGHT palette)
// Single source of truth for onboarding visuals.

export const OB = {
  bg: '#0a0a0a',
  surface: '#161616',
  elevated: '#1f1f1f',
  border: '#262626',
  borderSubtle: '#1f1f1f',
  borderFocus: '#f59e0b',
  textPrimary: '#fafafa',
  textSecondary: '#d4d4d4',
  textMuted: '#a3a3a3',
  textFaint: '#525252',
  accent: '#f59e0b',
  accentHover: '#fbbf24',
  accentSoft: 'rgba(245, 158, 11, 0.16)',
  success: '#f59e0b', // unified — no jarring green check on confirmation
  successBg: 'rgba(245, 158, 11, 0.12)',
  danger: '#ef4444',
  white: '#fafafa',
  inverse: '#0a0a0a', // text on accent buttons
} as const;

export const OBFonts = {
  serif: 'Georgia',
  sans: undefined,
} as const;
