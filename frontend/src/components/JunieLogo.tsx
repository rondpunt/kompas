import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Junie brand colors
const BLAUW  = '#4A90E2';
const GROEN  = '#7ED957';
const GEL    = '#F5C84B';
const ORANJE = '#F39C4D';
const KORAAL = '#E85A5A';

const DOT_COLORS = [BLAUW, GROEN, GEL];

interface Props {
  size?: number;
  variant?: 'full' | 'icon' | 'wordmark';
  monochrome?: boolean;  // use in sidebar — no colors
}

export function JunieLogo({ size = 32, variant = 'full', monochrome = false }: Props) {
  const dotSize = Math.max(6, size * 0.18);

  const icon = (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: monochrome ? '#F0F0F0' : BLAUW + '18' }]}>
      <Text style={{ fontSize: size * 0.55 }}>🌱</Text>
    </View>
  );

  const dots = (
    <View style={[styles.dotsRow, { gap: dotSize * 0.5 }]}>
      {DOT_COLORS.map((color, i) => (
        <View key={i} style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: monochrome ? '#CCCCCC' : color }]} />
      ))}
    </View>
  );

  if (variant === 'icon') return icon;
  if (variant === 'wordmark') return (
    <View style={styles.wordmarkWrap}>
      <Text style={[styles.wordmark, { fontSize: size, color: monochrome ? '#1A1F36' : '#1A1F36' }]}>Junie</Text>
      {!monochrome && dots}
    </View>
  );

  // Full: icon + wordmark
  return (
    <View style={styles.full}>
      {icon}
      <View style={{ marginLeft: 10 }}>
        <Text style={[styles.wordmark, { fontSize: size * 0.7 }]}>Junie</Text>
        {!monochrome && dots}
      </View>
    </View>
  );
}

// Backwards-compat named export
export { JunieLogo as Wordmark };

export default JunieLogo;

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center' },
  full: { flexDirection: 'row', alignItems: 'center' },
  wordmarkWrap: { alignItems: 'flex-start' },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#1A1F36',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: {},
});
