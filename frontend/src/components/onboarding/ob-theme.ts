// Onboarding design tokens — Junie v4 light (ChatGPT-witte basis + Junie merkintegratie)
export const OB = {
  bg: '#FFFFFF',
  surface: '#F9FAFB',
  elevated: '#FFFFFF',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  borderFocus: '#4A90E2',
  textPrimary: '#111111',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  // Junie merkkleuren
  accent: '#4A90E2',       // Blauw — vertrouwen, primaire CTA
  accentLight: '#5BA3F0',
  accentHover: '#3A7FCC',
  accentSoft: 'rgba(74,144,226,0.08)',
  accentSoft15: 'rgba(74,144,226,0.15)',
  green: '#7ED957',        // Groei, succes
  greenSoft: 'rgba(126,217,87,0.12)',
  yellow: '#F5C84B',       // Inzichten
  yellowSoft: 'rgba(245,200,75,0.12)',
  orange: '#F39C4D',       // Energie, streak
  orangeSoft: 'rgba(243,156,77,0.12)',
  coral: '#E85A5A',        // Empathie, community
  coralSoft: 'rgba(232,90,90,0.12)',
  success: '#7ED957',
  successBg: '#ECFDF5',
  danger: '#E85A5A',
  white: '#FFFFFF',
  inverse: '#FFFFFF',
} as const;

export const OBFonts = {
  brand: 'Nunito',
  serif: 'Georgia',
  sans: undefined,
} as const;

// Multi-color Junie gradient kleuren
export const JUNIE_COLORS = ['#4A90E2', '#7ED957', '#F5C84B', '#F39C4D', '#E85A5A'] as const;
