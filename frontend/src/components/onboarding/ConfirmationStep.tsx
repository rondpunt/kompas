import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';
import { APP_NAME } from '@/src/config/branding';

interface Props {
  trialEndsAt: string | null;
  onChat: () => void;
  onTests: () => void;
  onSettings: () => void;
  onDone: () => void;
}

const NEXT_STEPS = [
  { icon: 'message-circle' as const, title: 'Begin een gesprek', desc: 'Praat over wat speelt.' },
  { icon: 'check-square' as const, title: 'Verken de testen', desc: '24 gevalideerde screeners.' },
  { icon: 'settings' as const, title: 'Stel jezelf in', desc: 'Thema, privacy, profiel.' },
];

export function ConfirmationStep({ trialEndsAt, onChat, onTests, onSettings, onDone }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const endDate = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })
    : null;

  const handlers = [onChat, onTests, onSettings];

  return (
    <SafeAreaView style={s.root}>
      <View style={s.content}>
        <Animated.View style={[s.checkWrap, { transform: [{ scale }] }]}>
          <View style={s.haloOuter}>
            <View style={s.haloInner}>
              <Feather name="check" size={26} color={OB.accent} />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fade, width: '100%' }}>
          <Text style={s.headline}>Je bent klaar</Text>

          {endDate ? (
            <Text style={s.subtext}>
              Je 14-daagse trial loopt. Eerste betaling op {endDate}.
            </Text>
          ) : (
            <Text style={s.subtext}>
              Ga verder waar je was, of begin iets nieuws.
            </Text>
          )}

          <View style={s.cards}>
            {NEXT_STEPS.map((step, i) => (
              <TouchableOpacity key={i} style={s.card} onPress={handlers[i]} activeOpacity={0.75}>
                <View style={s.cardIcon}>
                  <Feather name={step.icon} size={16} color={OB.accent} />
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardTitle}>{step.title}</Text>
                  <Text style={s.cardDesc}>{step.desc}</Text>
                </View>
                <Feather name="chevron-right" size={15} color={OB.textFaint} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>

      <View style={s.ctaWrap}>
        <TouchableOpacity style={s.cta} onPress={onDone} activeOpacity={0.85}>
          <Text style={s.ctaText}>Begin met {APP_NAME}</Text>
          <Feather name="arrow-right" size={17} color={OB.inverse} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, alignItems: 'center' },
  checkWrap: { marginBottom: 18 },
  haloOuter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 1, borderColor: OB.accent + '22', backgroundColor: OB.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  haloInner: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 1, borderColor: OB.accent + '55', backgroundColor: OB.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  headline: {
    fontSize: 28, fontWeight: '500', color: OB.textPrimary,
    lineHeight: 34, marginBottom: 8, textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }),
    letterSpacing: -0.4,
  },
  subtext: {
    fontSize: 14, color: OB.textMuted, lineHeight: 20,
    textAlign: 'center', marginBottom: 24, paddingHorizontal: 12,
  },
  cards: { gap: 8, width: '100%' },
  card: {
    backgroundColor: OB.surface, borderWidth: 0.5, borderColor: OB.border,
    borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: OB.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: OB.textPrimary },
  cardDesc: { fontSize: 12.5, color: OB.textMuted, marginTop: 1 },
  ctaWrap: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 6 },
  cta: {
    height: 52, borderRadius: 14, backgroundColor: OB.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  ctaText: { fontSize: 15.5, fontWeight: '700', color: OB.inverse, letterSpacing: 0.1 },
});
