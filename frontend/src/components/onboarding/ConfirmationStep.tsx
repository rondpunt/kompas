import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB } from './ob-theme';

interface Props {
  trialEndsAt: string | null;
  onChat: () => void;
  onTests: () => void;
  onSettings: () => void;
  onDone: () => void;
}

const NEXT_STEPS = [
  { icon: 'message-circle' as const, title: 'Verder met gesprek', desc: 'Ga verder waar je was.', cta: 'Open chat' },
  { icon: 'file-text' as const, title: 'Verken de tests', desc: '24 gevalideerde screenings zoals PHQ-9 en GAD-7.', cta: 'Bekijk tests' },
  { icon: 'settings' as const, title: 'Instellingen aanpassen', desc: 'Thema, privacy, notificaties.', cta: 'Naar instellingen' },
];

export function ConfirmationStep({ trialEndsAt, onChat, onTests, onSettings, onDone }: Props) {
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const endDate = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })
    : null;

  const handlers = [onChat, onTests, onSettings];

  return (
    <SafeAreaView style={s.root}>
      <View style={s.content}>
        {/* Check icon */}
        <Animated.View style={[s.checkWrap, { transform: [{ scale: checkScale }] }]}>
          <View style={s.checkCircle}>
            <Feather name="check" size={28} color={OB.success} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: contentFade }}>
          <Text style={s.headline}>Je bent klaar om{`\n`}te beginnen</Text>

          {endDate ? (
            <Text style={s.subtext}>
              Je 14-daagse trial is gestart. We sturen je een herinnering voordat we je eerste betaling doen op {endDate}.
            </Text>
          ) : (
            <Text style={s.subtext}>
              Je gesprek staat klaar. Ga verder waar je was, of begin iets nieuws.
            </Text>
          )}

          {/* Next steps */}
          <View style={s.cards}>
            {NEXT_STEPS.map((step, i) => (
              <TouchableOpacity key={i} style={s.card} onPress={handlers[i]} activeOpacity={0.8}>
                <View style={s.cardIcon}>
                  <Feather name={step.icon} size={18} color={OB.accent} />
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardTitle}>{step.title}</Text>
                  <Text style={s.cardDesc}>{step.desc}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={OB.textFaint} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>

      <View style={s.ctaWrap}>
        <TouchableOpacity style={s.ctaBtn} onPress={onDone} activeOpacity={0.85}>
          <Text style={s.ctaText}>Begin met Kompas</Text>
          <Feather name="arrow-right" size={17} color={OB.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  checkWrap: { alignItems: 'center', marginBottom: 32 },
  checkCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: OB.successBg, borderWidth: 1.5,
    borderColor: OB.success + '55', alignItems: 'center', justifyContent: 'center',
  },
  headline: {
    fontSize: 30, fontWeight: '500', color: OB.textPrimary,
    lineHeight: 38, marginBottom: 14, textAlign: 'center',
  },
  subtext: {
    fontSize: 15, color: OB.textSecondary, lineHeight: 23,
    textAlign: 'center', marginBottom: 32,
  },
  cards: { gap: 12 },
  card: {
    backgroundColor: OB.surface, borderWidth: 1, borderColor: OB.border,
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: OB.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: OB.textPrimary },
  cardDesc: { fontSize: 13, color: OB.textMuted, marginTop: 2 },
  ctaWrap: { paddingHorizontal: 24, paddingBottom: 28, paddingTop: 8 },
  ctaBtn: {
    height: 56, borderRadius: 16, backgroundColor: OB.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...(
      { shadowColor: OB.accent, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }
    ),
  },
  ctaText: { fontSize: 16, fontWeight: '600', color: OB.white },
});
