import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';
import { APP_NAME } from '@/src/config/branding';

interface QuizConfig { progress: string; question: string; options: string[]; multiSelect: boolean; subtext?: string; }
interface Props { config: QuizConfig; onAnswer: (value: string | string[]) => void; onSkip: () => void; }

export function QuizStep({ config, onAnswer, onSkip }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggle = (opt: string) => {
    if (config.multiSelect) {
      setSelected((prev) => prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]);
    } else { onAnswer(opt); }
  };

  const [num, total] = config.progress.split('/').map(Number);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(num / total) * 100}%` }]} />
        </View>
        <View style={s.headRow}>
          <Text style={s.stepLabel}>Stap {config.progress}</Text>
          <TouchableOpacity onPress={onSkip} hitSlop={8}><Text style={s.skipTopText}>Overslaan</Text></TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
        style={{ opacity: fade, transform: [{ translateY: slideY }] }}>
        <Text style={s.question}>{config.question}</Text>
        {config.subtext ? <Text style={s.subtext}>{config.subtext}</Text> : null}
        <View style={s.options}>
          {config.options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <TouchableOpacity key={opt} style={[s.card, isSelected && s.cardSelected]} onPress={() => toggle(opt)} activeOpacity={0.75}>
                {config.multiSelect ? (
                  <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                    {isSelected && <Feather name="check" size={12} color={OB.inverse} />}
                  </View>
                ) : (
                  <View style={[s.radio, isSelected && s.radioSelected]}>
                    {isSelected && <View style={s.radioDot} />}
                  </View>
                )}
                <Text style={[s.cardText, isSelected && s.cardTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.ScrollView>

      {config.multiSelect && (
        <View style={s.ctaWrap}>
          <TouchableOpacity style={[s.cta, selected.length === 0 && s.ctaDisabled]}
            onPress={() => selected.length > 0 ? onAnswer(selected) : onSkip()} activeOpacity={0.85}>
            <Text style={[s.ctaText, selected.length === 0 && { color: OB.textMuted }]}>
              {selected.length > 0 ? `Verder · ${selected.length} gekozen` : 'Overslaan'}
            </Text>
            <Feather name="arrow-right" size={16} color={selected.length > 0 ? OB.inverse : OB.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export const QUIZ_INTENT: QuizConfig = { progress: '1/3', question: 'Waar hoop je op vandaag?', options: ['Gewoon praten over hoe ik me voel', 'Een moeilijke situatie verwerken', 'Begrijpen waarom ik me zo voel', 'Hulp bij iets waar ik mee worstel', 'Checken hoe het echt met me gaat', 'Anders, of weet ik nog niet'], multiSelect: true };
export const QUIZ_MOOD: QuizConfig = { progress: '2/3', question: 'Hoe was het de laatste weken?', options: ['Rustig, met af en toe een piek', 'Wisselend — goede en moeilijke door elkaar', 'Vaak onrustig of gespannen', 'Overwegend zwaar of uitgeput', 'Liever niet zeggen'], multiSelect: false, subtext: 'Dit helpt om af te stemmen op waar je nu staat.' };
export const QUIZ_THERAPY: QuizConfig = { progress: '3/3', question: 'Heb je ervaring met therapie?', options: ['Ja, momenteel', 'Ja, in het verleden', 'Nee, maar ik overweeg het', 'Nee, en dat is nu niet aan de orde', 'Liever niet zeggen'], multiSelect: false, subtext: `${APP_NAME} vervangt geen therapie.` };

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  header: { paddingTop: 8 },
  progressTrack: { height: 2, backgroundColor: OB.border, width: '100%', marginBottom: 12 },
  progressFill: { height: 2, backgroundColor: OB.accent },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 },
  stepLabel: { fontSize: 11.5, color: OB.accent, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  skipTopText: { fontSize: 13, color: OB.textMuted },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  question: { fontSize: 22, fontWeight: '500', lineHeight: 28, color: OB.textPrimary, fontStyle: 'italic', fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }), marginBottom: 8, letterSpacing: -0.3 },
  subtext: { fontSize: 13, color: OB.textMuted, marginBottom: 18, lineHeight: 19 },
  options: { gap: 8, marginTop: 4 },
  card: { backgroundColor: OB.surface, borderWidth: 0.5, borderColor: OB.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  cardSelected: { borderColor: OB.accent, backgroundColor: OB.accentSoft },
  cardText: { fontSize: 14, color: OB.textSecondary, flex: 1, lineHeight: 19 },
  cardTextSelected: { color: OB.textPrimary, fontWeight: '500' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: OB.textFaint, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: OB.accent, borderColor: OB.accent },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: OB.textFaint, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: OB.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: OB.accent },
  ctaWrap: { paddingHorizontal: 20, paddingBottom: 14, paddingTop: 6, backgroundColor: OB.bg },
  cta: { height: 50, borderRadius: 14, backgroundColor: OB.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Platform.select({ ios: { shadowColor: OB.accent, shadowOpacity: 0.30, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 4 } }) },
  ctaDisabled: { backgroundColor: OB.surface, borderWidth: 0.5, borderColor: OB.border },
  ctaText: { fontSize: 14.5, fontWeight: '700', color: OB.inverse },
});
