import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Junie 5 brand colors — één per categorie
const CATEGORY_COLORS: Record<string, { bg: string; emoji: string }> = {
  angst:        { bg: '#4A90E222', emoji: '😤' },
  depressie:    { bg: '#7ED95722', emoji: '🌱' },
  stress:       { bg: '#F5C84B22', emoji: '🌀' },
  slaap:        { bg: '#F39C4D22', emoji: '🌙' },
  relaties:     { bg: '#E85A5A22', emoji: '💙' },
  zelfvertrouwen:{ bg: '#4A90E222', emoji: '⭐' },
  rouw:         { bg: '#7ED95722', emoji: '🕊️' },
  burn_out:     { bg: '#F5C84B22', emoji: '🔥' },
  default:      { bg: '#4A90E222', emoji: '🌿' },
};

interface Props {
  category?: string;
  size?: number;
}

export function CategoryIcon({ category = 'default', size = 40 }: Props) {
  const key = (category || 'default').toLowerCase().replace(/ /g, '_');
  const cfg = CATEGORY_COLORS[key] ?? CATEGORY_COLORS['default'];

  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size / 4, backgroundColor: cfg.bg }]}>
      <Text style={{ fontSize: size * 0.45 }}>{cfg.emoji}</Text>
    </View>
  );
}

export default CategoryIcon;

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center' },
});
