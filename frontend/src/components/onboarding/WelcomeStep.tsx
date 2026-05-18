import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';
import { APP_NAME } from '@/src/config/branding';

interface Props {
  onNext: () => void;
}

const FEATURES = [
  { icon: 'message-square' as const, label: 'AI-gesprek dat échte vragen stelt' },
  { icon: 'check-square' as const, label: '24 gevalideerde zelftesten' },
  { icon: 'lock' as const, label: 'Anoniem starten — EU-servers' },
];

export function WelcomeStep({ onNext }: Props) {
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.content, { opacity: fade }]}>
        <View style={s.brandRow}>
          <View style={s.dot} />
          <Text style={s.brand}>{APP_NAME}</Text>
        </View>

        <View style={s.center}>
          <View style={s.haloOuter}>
            <View style={s.haloInner}>
              <Feather name="compass" size={28} color={OB.accent} />
            </View>
          </View>

          <Text style={s.headline}>Welkom bij {APP_NAME}</Text>
          <Text style={s.body}>
            Een rustige plek om eerlijk te praten over wat speelt. Geen oordeel, geen toxic positiviteit.
          </Text>

          <View style={s.features}>
            {FEATURES.map((f) => (
              <View key={f.label} style={s.feat}>
                <View style={s.featIcon}>
                  <Feather name={f.icon} size={13} color={OB.accent} />
                </View>
                <Text style={s.featText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.bottom}>
          <TouchableOpacity style={s.cta} onPress={onNext} activeOpacity={0.85}>
            <Text style={s.ctaText}>Begin gesprek</Text>
            <Feather name="arrow-right" size={17} color={OB.inverse} />
          </TouchableOpacity>
          <Text style={s.privacy}>Anoniem · Versleuteld · Niets wordt doorverkocht</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: OB.textPrimary },
  brand: { fontSize: 15, fontWeight: '600', color: OB.textPrimary, letterSpacing: -0.3 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  haloOuter: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 1, borderColor: OB.accent + '22', backgroundColor: OB.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  haloInner: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1, borderColor: OB.accent + '55', backgroundColor: OB.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  headline: {
    fontSize: 28, fontWeight: '500', color: OB.textPrimary,
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }),
    letterSpacing: -0.4, textAlign: 'center',
  },
  body: {
    fontSize: 14.5, lineHeight: 21, color: OB.textMuted,
    textAlign: 'center', maxWidth: 320, paddingHorizontal: 12, marginBottom: 4,
  },
  features: { width: '100%', maxWidth: 320, gap: 10, marginTop: 6 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  featIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: OB.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  featText: { fontSize: 13.5, color: OB.textSecondary, flex: 1, lineHeight: 19 },
  bottom: { gap: 10 },
  cta: {
    height: 52, borderRadius: 14, backgroundColor: OB.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  ctaText: { fontSize: 15.5, fontWeight: '700', color: OB.inverse, letterSpacing: 0.1 },
  privacy: { textAlign: 'center', fontSize: 11, color: OB.textFaint, letterSpacing: 0.3 },
});
