import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { getAssessment } from "@/src/data/assessments";

interface Props {
  testId: string;
}

export function TestSuggestionPill({ testId }: Props) {
  const { palette } = useTheme();
  const router = useRouter();
  const assessment = getAssessment(testId);
  if (!assessment) return null;

  return (
    <TouchableOpacity
      testID={`test-suggestion-${testId}`}
      activeOpacity={0.7}
      onPress={() => router.push(`/zelftesten/${testId}` as any)}
      style={[
        styles.pill,
        {
          backgroundColor: palette.surfaceElevated,
          borderColor: palette.borderDefault,
        },
      ]}
    >
      <View style={[styles.bullet, { backgroundColor: palette.accent }]} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: palette.textPrimary }]} numberOfLines={1}>
          {assessment.title}-screener
        </Text>
        <Text style={[styles.meta, { color: palette.textMuted }]} numberOfLines={1}>
          {assessment.questionCount} vragen · {assessment.estimatedMinutes} min · vrijblijvend
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={palette.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 0.5,
    marginTop: 12,
    alignSelf: "flex-start",
    maxWidth: "96%",
    gap: 10,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  textCol: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
});
