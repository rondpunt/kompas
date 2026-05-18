import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB } from './ob-theme';
import { APP_NAME } from '@/src/config/branding';
import { JunieLogo } from '@/src/components/JunieLogo';

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
        <View style={s.center}>
          {/* Vijfkleurig Junie-woordmerk (hero) */}
          <JunieLogo variant="multicolor" size={56} align="center" style={{ marginBottom: 18 }} />

          <Text style={s.headline}>Welkom bij {APP_NAME}</Text>
          <Text style={s.body}>
            Een rustige plek om eerlijk te praten over wat speelt. Geen oordeel, geen toxic positiviteit.
          </Text>

          <View style={s.features}>
            {FEATURES.map((f) => (
              <View key={f.label} style={s.feat}>
                <View style={s.featIcon}>
                  <Feather name={f.icon} size={14} color={OB.accent} />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  headline: {
    fontSize: 28, fontWeight: '700', color: OB.textPrimary,
    fontFamily: Platform.select({ ios: 'Nunito', android: 'sans-serif', default: 'system-ui' }),
    letterSpacing: -0.4, textAlign: 'center',
  },
  body: {
    fontSize: 15, lineHeight: 22, color: OB.textMuted,
    textAlign: 'center', maxWidth: 320, paddingHorizontal: 12, marginBottom: 6,
  },
  features: { width: '100%', maxWidth: 320, gap: 12, marginTop: 8 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: OB.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  featText: { fontSize: 14, color: OB.textSecondary, flex: 1, lineHeight: 19 },
  bottom: { gap: 10 },
  cta: {
    height: 52, borderRadius: 8, backgroundColor: OB.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  ctaText: { fontSize: 16, fontWeight: '600', color: OB.inverse, letterSpacing: 0.1 },
  privacy: { textAlign: 'center', fontSize: 11.5, color: OB.textFaint, letterSpacing: 0.3 },
});
