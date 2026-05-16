import React, { useState, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import {
  getAssessment,
  getQuestionText,
  getQuestionOptions,
} from "@/src/data/assessments";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { api } from "@/src/api/client";

export default function TestUitvoer() {
  const { palette } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assessment = useMemo(() => (id ? getAssessment(id) : null), [id]);

  const [idx, setIdx] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!assessment) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
        <Text style={[styles.errText, { color: palette.textPrimary }]}>Test niet gevonden.</Text>
      </SafeAreaView>
    );
  }

  const total = assessment.questionCount;
  const progress = idx < 0 ? 0 : (idx + 1) / total;

  const currentQuestion = idx >= 0 ? assessment.questions[idx] : null;
  const currentOptions =
    currentQuestion && assessment.answerOptions
      ? getQuestionOptions(currentQuestion, assessment.answerOptions)
      : currentQuestion
      ? getQuestionOptions(currentQuestion, [])
      : [];

  const onSelect = useCallback(
    (value: number) => {
      if (submitting) return;
      const newAnswers = [...answers];
      newAnswers[idx] = value;
      setAnswers(newAnswers);

      setTimeout(() => {
        if (idx + 1 >= total) {
          finish(newAnswers);
        } else {
          setIdx(idx + 1);
        }
      }, 200);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, idx, total, submitting],
  );

  const finish = async (finalAnswers: number[]) => {
    if (!assessment) return;
    setSubmitting(true);
    setError(null);
    try {
      const score = assessment.scoreFunction(finalAnswers);
      const interp = assessment.interpret(score, finalAnswers);
      const subscales = assessment.subscaleScores
        ? assessment.subscaleScores(finalAnswers)
        : null;
      const crisis = assessment.crisisCheck ? assessment.crisisCheck(finalAnswers) : false;

      const saved = await api.saveAssessmentResult({
        assessment_id: assessment.id,
        assessment_title: `${assessment.title} — ${assessment.subtitle}`,
        raw_answers: finalAnswers,
        total_score: score,
        max_score: assessment.maxScore,
        interpretation_label: interp.label,
        interpretation_tier: interp.tier,
        subscales,
        crisis_flag: crisis,
        narrative: null,
      });

      router.replace(`/zelftesten/${assessment.id}/result/${saved.id}` as any);
    } catch (e: any) {
      console.warn(e);
      setError("Resultaat kon niet opgeslagen worden. Probeer opnieuw.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (idx <= 0) {
      router.back();
    } else {
      setIdx(idx - 1);
    }
  };

  // Intro screen
  if (idx < 0) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
          <TouchableOpacity testID="test-back" onPress={() => router.back()} style={styles.iconBtn}>
            <Feather name="chevron-left" size={22} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: palette.textPrimary }]} numberOfLines={1}>
            {assessment.title}
          </Text>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.introBody} testID="test-intro">
          <CategoryIcon category={assessment.category} size={56} iconSize={24} />
          <Text style={[styles.introTitle, { color: palette.textPrimary }]}>
            {assessment.title}
          </Text>
          <Text style={[styles.introSubtitle, { color: palette.textSecondary }]}>
            {assessment.subtitle}
          </Text>
          <Text style={[styles.introMeta, { color: palette.textMuted }]}>
            {assessment.questionCount} vragen · {assessment.estimatedMinutes} min
          </Text>

          <View style={[styles.divider, { backgroundColor: palette.borderSubtle }]} />

          <Text style={[styles.introDescription, { color: palette.textPrimary }]}>
            {assessment.description}
          </Text>
          <Text style={[styles.introInstructions, { color: palette.textSecondary }]}>
            {assessment.intro}
          </Text>

          <Text style={[styles.introSource, { color: palette.textMuted }]}>
            Bron: {assessment.source}
          </Text>
        </ScrollView>

        <View style={styles.startBtnWrap}>
          <TouchableOpacity
            testID="test-start"
            onPress={() => setIdx(0)}
            style={[styles.startBtn, { backgroundColor: palette.textPrimary }]}
          >
            <Text style={[styles.startBtnText, { color: palette.inversePrimary }]}>
              Begin test
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { borderTopColor: palette.borderSubtle }]}>
          <Text style={[styles.footerText, { color: palette.textMuted }]}>
            Indicatie — geen diagnose
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Question screen
  const qText = currentQuestion ? getQuestionText(currentQuestion) : "";
  const selectedValue = answers[idx];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="test-back" onPress={goBack} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]} numberOfLines={1}>
          {assessment.title}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={[styles.progressTrack, { backgroundColor: palette.borderSubtle }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: palette.accent, width: `${progress * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.qBody} testID="test-question">
        <Text style={[styles.eyebrow, { color: palette.textMuted }]}>
          VRAAG {idx + 1} VAN {total}
        </Text>

        <Text style={[styles.qText, { color: palette.textPrimary }]}>{qText}</Text>

        {assessment.contextLabel && (
          <Text style={[styles.qContext, { color: palette.textMuted }]}>
            {assessment.contextLabel}
          </Text>
        )}

        <View style={{ height: 22 }} />

        {currentOptions.map((opt, i) => {
          const isSelected = selectedValue === opt.value;
          return (
            <TouchableOpacity
              key={`${idx}-${i}`}
              testID={`option-${i}`}
              activeOpacity={0.7}
              onPress={() => onSelect(opt.value)}
              disabled={submitting}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? palette.accentSoft : palette.surfaceElevated,
                  borderColor: isSelected ? palette.accent : palette.borderDefault,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? palette.accent : palette.textPrimary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {error && <Text style={[styles.errText, { color: palette.danger }]}>{error}</Text>}
      </ScrollView>

      {submitting && (
        <View style={styles.savingOverlay} testID="test-saving">
          <ActivityIndicator size="small" color={palette.accent} />
          <Text style={[styles.savingText, { color: palette.textSecondary }]}>
            Resultaat opslaan…
          </Text>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: palette.borderSubtle }]}>
        <Text style={[styles.footerText, { color: palette.textMuted }]}>
          Indicatie — geen diagnose
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  progressTrack: {
    height: 2,
    width: "100%",
  },
  progressFill: {
    height: 2,
  },
  introBody: {
    padding: 24,
    alignItems: "center",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "500",
    marginTop: 14,
    letterSpacing: -0.4,
  },
  introSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  introMeta: {
    fontSize: 12,
    marginTop: 8,
  },
  divider: {
    height: 0.5,
    width: "100%",
    marginVertical: 22,
  },
  introDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "left",
    alignSelf: "stretch",
    marginBottom: 16,
  },
  introInstructions: {
    fontSize: 13.5,
    lineHeight: 20,
    alignSelf: "stretch",
    marginBottom: 18,
  },
  introSource: {
    fontSize: 11,
    alignSelf: "stretch",
  },
  startBtnWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  startBtn: {
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },
  qBody: {
    padding: 20,
    paddingBottom: 60,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  qText: {
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 24,
  },
  qContext: {
    fontSize: 12,
    marginTop: 6,
  },
  option: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 9,
  },
  optionText: {
    fontSize: 15,
  },
  errText: {
    fontSize: 13,
    marginTop: 14,
    textAlign: "center",
  },
  footer: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 0.5,
  },
  footerText: {
    fontSize: 10.5,
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  savingText: {
    fontSize: 13,
  },
});
