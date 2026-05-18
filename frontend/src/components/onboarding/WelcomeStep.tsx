import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB } from './ob-theme';
import { APP_NAME } from '@/src/config/branding';
import { JunieLogo } from '@/src/components/JunieLogo';

interface Props { onNext: () => void; }

const FEATURES = [
  { icon: 'message-square' as const, label: 'AI-gesprek dat echte vragen stelt', color: OB.accent },
  { icon: 'check-square' as const, label: '24 gevalideerde zelftesten', color: OB.green },
  { icon: 'lock' as const, label: 'Anoniem starten — EU-servers', color: OB.coral },
];

export function WelcomeStep({ onNext }: Props) {
  const fade = React.useRef(new Animated.Value(0)).current;
  const slideY = React.useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 600, delay: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.content, { opacity: fade, transform: [{ translateY: slideY }] }]}>
        <View style={s.center}>
          <View style={s.logoWrap}>
            <JunieLogo variant="multicolor" size={64} align="center" />
          </View>
          <Text style={s.headline}>Welkom bij {APP_NAME}</Text>
          <Text style={s.body}>
            Een rustige plek om eerlijk te praten over wat speelt. Geen oordeel, geen toxic positiviteit.
          </Text>
          <View style={s.features}>
            {FEATURES.map((f) => (
              <View key={f.label} style={s.feat}>
                <View style={[s.featIcon, { backgroundColor: f.color + '18' }]}>
                  <Feather name={f.icon} size={15} color={f.color} />
                </View>
                <Text style={s.featText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.bottom}>
          <TouchableOpacity style={s.cta} onPress={onNext} activeOpacity={0.85}>
            <Text style={s.ctaText}>Begin gesprek</Text>
            <Feather name="arrow-right" size={18} color={OB.inverse} />
          </TouchableOpacity>
          <Text style={s.privacy}>Anoniem · Versleuteld · Niets wordt doorverkocht</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 8, paddingBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoWrap: { marginBottom: 28, alignItems: 'center' },
  headline: {
    fontSize: 30, fontWeight: '700', color: OB.textPrimary, marginBottom: 12,
    fontFamily: Platform.select({ ios: 'Nunito', android: 'sans-serif', default: 'system-ui' }),
    letterSpacing: -0.6, textAlign: 'center',
  },
  body: { fontSize: 15.5, lineHeight: 23, color: OB.textMuted, textAlign: 'center', maxWidth: 300, marginBottom: 32 },
  features: { width: '100%', maxWidth: 340, gap: 16 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featText: { fontSize: 14.5, color: OB.textSecondary, flex: 1, lineHeight: 20 },
  bottom: { gap: 12 },
  cta: {
    height: 54, borderRadius: 14, backgroundColor: OB.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 5 } },
      android: { elevation: 5 },
    }),
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: OB.inverse },
  privacy: { textAlign: 'center', fontSize: 11.5, color: OB.textFaint, letterSpacing: 0.3 },
});
