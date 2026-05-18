import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { api } from "@/src/api/client";
import { PlusModal, PlusReason } from "@/src/components/PlusModal";

interface ResultDoc {
  id: string;
  assessment_id: string;
  assessment_title: string;
  total_score: number;
  max_score: number;
  interpretation_label: string;
  interpretation_tier: "low" | "mid" | "high";
  subscales?: Record<string, any> | null;
  crisis_flag: boolean;
  narrative?: string | null;
  completed_at: string;
}

export default function TestResult() {
  const { palette } = useTheme();
  const router = useRouter();
  const { id, resultId } = useLocalSearchParams<{ id: string; resultId: string }>();
  const [result, setResult] = useState<ResultDoc | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plusModal, setPlusModal] = useState<PlusReason | null>(null);

  const loadResult = useCallback(async () => {
    if (!resultId) return;
    try {
      const r = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/assessment-results/${resultId}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: ResultDoc = await r.json();
      setResult(data);
      if (data.narrative) {
        setNarrative(data.narrative);
      }
    } catch (e: any) {
      console.warn(e);
      setError("Resultaat kon niet geladen worden.");
    }
  }, [resultId]);

  const generateNarrative = useCallback(async () => {
    if (!result || narrative) return;
    setNarrativeLoading(true);
    try {
      const res = await api.assessmentNarrative({
        assessment_id: result.assessment_id,
        assessment_title: result.assessment_title,
        score: result.total_score,
        max_score: result.max_score,
        interpretation_label: result.interpretation_label,
        subscales: result.subscales ?? null,
        crisis_flag: result.crisis_flag,
      });
      setNarrative(res.narrative);
    } catch (e) {
      console.warn(e);
      setNarrative(
        `Je hebt ${result.total_score} van ${result.max_score} gescoord — categorie "${result.interpretation_label.toLowerCase()}". Wat dit betekent verschilt per persoon. Misschien iets om met een huisarts of psycholoog te bespreken. Dit is een indicatie, geen diagnose.`,
      );
    } finally {
      setNarrativeLoading(false);
    }
  }, [result, narrative]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  useEffect(() => {
    if (result && !narrative) generateNarrative();
  }, [result, narrative, generateNarrative]);

  if (error) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
        <Text style={[styles.errText, { color: palette.danger }]}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={[styles.root, styles.center, { backgroundColor: palette.background }]}>
        <ActivityIndicator color={palette.accent} />
      </SafeAreaView>
    );
  }

  const tier = result.interpretation_tier;
  const pillStyle =
    tier === "low"
      ? { bg: palette.successBg, fg: palette.success }
      : tier === "mid"
      ? { bg: palette.accentSoft, fg: palette.accent }
      : { bg: palette.dangerBg, fg: palette.danger };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="result-back" onPress={() => router.replace("/zelftesten")} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]} numberOfLines={1}>
          Resultaat
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} testID="result-body">
        <View style={[styles.pill, { backgroundColor: pillStyle.bg }]}>
          <Text style={[styles.pillText, { color: pillStyle.fg }]}>
            {result.interpretation_label}
          </Text>
        </View>

        <Text style={[styles.score, { color: palette.textPrimary }]} testID="result-score">
          {result.total_score}
          <Text style={[styles.scoreSlash, { color: palette.textMuted }]}>
            /{result.max_score}
          </Text>
        </Text>

        <Text style={[styles.context, { color: palette.textMuted }]}>
          {result.assessment_title}
        </Text>

        {result.subscales && Object.keys(result.subscales).length > 0 && (
          <View style={[styles.subscaleBox, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
            {Object.entries(result.subscales).map(([k, v]) => (
              <View key={k} style={styles.subscaleRow}>
                <Text style={[styles.subscaleLabel, { color: palette.textMuted }]}>{k}</Text>
                <Text style={[styles.subscaleValue, { color: palette.textPrimary }]}>{String(v)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.narrativeBlock}>
          {narrativeLoading && !narrative ? (
            <View style={styles.narrativeLoading}>
              <ActivityIndicator color={palette.accent} size="small" />
              <Text style={[styles.narrativeLoadingText, { color: palette.textMuted }]}>
                Junie schrijft je uitleg…
              </Text>
            </View>
          ) : (
            <Text style={[styles.narrativeText, { color: palette.textPrimary }]} testID="result-narrative">
              {narrative}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionsStack}>
        <TouchableOpacity
          testID="result-memory"
          onPress={() => setPlusModal("memory")}
          activeOpacity={0.75}
          style={[styles.secondaryBtn, { borderColor: palette.borderDefault }]}
        >
          <Feather name="bookmark" size={15} color={palette.textPrimary} />
          <Text style={[styles.secondaryBtnText, { color: palette.textPrimary }]}>
            Bewaar in geheugen
          </Text>
          <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}>
            <Text style={styles.plusBadgeText}>PLUS</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          testID="result-pdf"
          onPress={() => setPlusModal("pdf")}
          activeOpacity={0.75}
          style={[styles.secondaryBtn, { borderColor: palette.borderDefault }]}
        >
          <Feather name="download" size={15} color={palette.textPrimary} />
          <Text style={[styles.secondaryBtnText, { color: palette.textPrimary }]}>
            PDF voor therapeut
          </Text>
          <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}>
            <Text style={styles.plusBadgeText}>PLUS</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          testID="result-close"
          onPress={() => router.replace("/zelftesten")}
          style={[styles.primaryBtn, { backgroundColor: palette.textPrimary }]}
        >
          <Text style={[styles.primaryBtnText, { color: palette.inversePrimary }]}>
            Opslaan en sluiten
          </Text>
        </TouchableOpacity>
      </View>

      <PlusModal
        visible={plusModal !== null}
        reason={plusModal ?? "generic"}
        onClose={() => setPlusModal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  topBar: {
    height: 48,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 14.5,
    fontWeight: "500",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 14,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  score: {
    fontSize: 56,
    fontWeight: "300",
    letterSpacing: -2,
    marginTop: 4,
  },
  scoreSlash: {
    fontSize: 32,
    fontWeight: "300",
  },
  context: {
    fontSize: 16,
    fontStyle: "italic",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    marginTop: 8,
    textAlign: "center",
  },
  subscaleBox: {
    alignSelf: "stretch",
    marginTop: 22,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  subscaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  subscaleLabel: {
    fontSize: 12.5,
  },
  subscaleValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  narrativeBlock: {
    marginTop: 24,
    alignSelf: "stretch",
  },
  narrativeText: {
    fontSize: 13.5,
    lineHeight: 22,
  },
  narrativeLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
  },
  narrativeLoadingText: {
    fontSize: 13,
    fontStyle: "italic",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
  },
  actionsStack: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 9,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 13,
    gap: 8,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 13,
    borderWidth: 0.5,
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  plusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plusBadgeText: {
    color: "#0a0a0a",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  errText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
