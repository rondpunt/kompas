import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';

interface Props {
  onNext: () => void;
}

const FEATURES = [
  'AI-gesprekspartner gebaseerd op Claude',
  '24 gevalideerde zelftesten (PHQ-9, GAD-7, ...)',
  'Privacy-first: anoniem starten mogelijk',
];

export function WelcomeStep({ onNext }: Props) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Logo mark */}
          <View style={s.logoWrap}>
            <View style={s.logoCircle}>
              <Feather name="compass" size={22} color={OB.accent} />
            </View>
            <Text style={s.logoText}>Kompas</Text>
          </View>

          {/* Headline */}
          <Text style={s.headline}>Welkom bij{`\n`}Kompas</Text>

          {/* Body */}
          <Text style={s.body}>
            {'Een veilige plek om te praten over wat er is.\nGeen dwang om te veranderen. Geen toxic positiviteit.\nGewoon een gesprek, wanneer je het nodig hebt.'}
          </Text>

          {/* Feature bullets */}
          <View style={s.featuresWrap}>
            {FEATURES.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <View style={s.featureDot} />
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={s.ctaWrap}>
          <TouchableOpacity style={s.ctaBtn} onPress={onNext} activeOpacity={0.85}>
            <Text style={s.ctaText}>Begin gesprek</Text>
            <Feather name="arrow-right" size={17} color={OB.white} />
          </TouchableOpacity>
          <Text style={s.privacyNote}>Privacy en data-gebruik: EU-servers, minimale opslag</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  content: { flex: 1 },
  scroll: { paddingHorizontal: 28, paddingTop: 56, paddingBottom: 24 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 48 },
  logoCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: OB.accentSoft, borderWidth: 1,
    borderColor: OB.accent + '44', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 17, fontWeight: '600', color: OB.textPrimary, letterSpacing: 0.5 },
  headline: {
    fontSize: 38, fontWeight: '500', lineHeight: 46,
    color: OB.textPrimary, fontStyle: 'italic',
    fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }),
    letterSpacing: -0.5, marginBottom: 24,
  },
  body: { fontSize: 17, lineHeight: 26, color: OB.textSecondary, marginBottom: 36 },
  featuresWrap: { gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: OB.accent },
  featureText: { fontSize: 15, color: OB.textMuted, flex: 1, lineHeight: 22 },
  ctaWrap: { paddingHorizontal: 28, paddingBottom: 20, paddingTop: 8 },
  ctaBtn: {
    backgroundColor: OB.accent, height: 56, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  ctaText: { fontSize: 16, fontWeight: '600', color: OB.white, letterSpacing: 0.2 },
  privacyNote: { textAlign: 'center', fontSize: 12, color: OB.textFaint, marginTop: 14 },
});
