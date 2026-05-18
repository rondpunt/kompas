import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import { LAYERS } from '@/src/theme/tokens';

const BLAUW  = '#4A90E2';
const GROEN  = '#7ED957';
const GEL    = '#F5C84B';

const getResult = (score: number) => {
  if (score <= 3)  return { label: 'Goed bezig',      color: GROEN, emoji: '🌱', advice: 'Je scoort laag — blijf bewust omgaan met je welzijn.' };
  if (score <= 6)  return { label: 'Let op jezelf',   color: GEL,   emoji: '🌻', advice: 'Er zijn een paar aandachtspunten. Neem kleine stappen.' };
  return               { label: 'Zoek steun',         color: BLAUW, emoji: '💙', advice: 'Je hebt wat extra aandacht nodig. Praat erover met iemand die je vertrouwt.' };
};

export default function TestResultScreen() {
  const { resultId, score } = useLocalSearchParams<{ resultId: string; score: string }>();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? LAYERS.DARK : LAYERS.LIGHT;
  const router = useRouter();

  const numScore = parseInt(score || '0', 10);
  const result = getResult(numScore);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ title: 'Resultaat', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Score circle */}
        <View style={styles.heroWrap}>
          <View style={[styles.circle, { borderColor: result.color }]}>
            <Text style={styles.emoji}>{result.emoji}</Text>
            <Text style={[styles.scoreLabel, { color: result.color }]}>{result.label}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.adviceTitle, { color: colors.text }]}>Wat dit betekent</Text>
          <Text style={[styles.adviceText, { color: colors.subtle }]}>{result.advice}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: BLAUW }]}
            onPress={() => router.push('/')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Bespreek met Junie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, { color: colors.text }]}>Opnieuw doen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  heroWrap: { alignItems: 'center', marginBottom: 32 },
  circle: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emoji: { fontSize: 48 },
  scoreLabel: { fontSize: 16, fontWeight: '700' },
  card: {
    borderRadius: 16, padding: 20, marginBottom: 24,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 2 } }),
  },
  adviceTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  adviceText: { fontSize: 15, lineHeight: 24 },
  actions: { gap: 12 },
  btn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
