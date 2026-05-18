import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import { LAYERS } from '@/src/theme/tokens';

const BLAUW  = '#4A90E2';
const GROEN  = '#7ED957';
const GEL    = '#F5C84B';
const ORANJE = '#F39C4D';
const KORAAL = '#E85A5A';

const ACCENT_COLORS = [BLAUW, GROEN, GEL, ORANJE, KORAAL];

interface Question {
  id: number;
  text: string;
  options: { label: string; value: number }[];
}

// Placeholder vragen - worden via API geladen
const PLACEHOLDER_QUESTIONS: Question[] = [
  { id: 1, text: 'Hoe vaak voelde je je de afgelopen week somber?', options: [{ label: 'Nooit', value: 0 }, { label: 'Soms', value: 1 }, { label: 'Regelmatig', value: 2 }, { label: 'Bijna altijd', value: 3 }] },
  { id: 2, text: 'Hoe goed sliep je de afgelopen week?', options: [{ label: 'Heel goed', value: 0 }, { label: 'Redelijk', value: 1 }, { label: 'Slecht', value: 2 }, { label: 'Heel slecht', value: 3 }] },
  { id: 3, text: 'Hoe energiek voelde je je?', options: [{ label: 'Vol energie', value: 0 }, { label: 'Redelijk', value: 1 }, { label: 'Moe', value: 2 }, { label: 'Uitgeput', value: 3 }] },
];

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? LAYERS.DARK : LAYERS.LIGHT;
  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const q = PLACEHOLDER_QUESTIONS[current];
  const total = PLACEHOLDER_QUESTIONS.length;
  const progress = current / total;
  const accent = ACCENT_COLORS[current % ACCENT_COLORS.length];

  const handleAnswer = (value: number) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (current + 1 < total) {
      setCurrent(current + 1);
    } else {
      const score = Object.values(next).reduce((a, b) => a + b, 0);
      router.push({ pathname: '/zelftesten/' + id + '/result/nieuw', params: { score: String(score) } });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ title: 'Zelftest', headerShown: true }} />
      
      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.counter, { color: colors.subtle }]}>
          Vraag {current + 1} van {total}
        </Text>
        <Text style={[styles.question, { color: colors.text }]}>{q.text}</Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.optBtn, { backgroundColor: colors.card, borderColor: accent + '40' }]}
              onPress={() => handleAnswer(opt.value)}
              activeOpacity={0.75}
            >
              <View style={[styles.optDot, { borderColor: accent }]}>
                {answers[q.id] === opt.value && <View style={[styles.optDotFill, { backgroundColor: accent }]} />}
              </View>
              <Text style={[styles.optLabel, { color: colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  progressBg: { height: 4, width: '100%' },
  progressFill: { height: 4, borderRadius: 2 },
  content: { padding: 24, paddingTop: 32 },
  counter: { fontSize: 13, fontWeight: '600', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  question: { fontSize: 22, fontWeight: '700', lineHeight: 32, marginBottom: 32 },
  options: { gap: 12 },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 56,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 1 } }),
  },
  optDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  optDotFill: { width: 10, height: 10, borderRadius: 5 },
  optLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
});
