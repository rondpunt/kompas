import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { ASSESSMENT_LIST, CATEGORIES, Assessment } from "@/src/data/assessments";
import { CategoryIcon } from "@/src/components/CategoryIcon";

export default function ZelftestenIndex() {
  const { palette } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState("alle");

  const filtered = useMemo(() => {
    if (filter === "alle") return ASSESSMENT_LIST;
    return ASSESSMENT_LIST.filter((a) => a.category === filter);
  }, [filter]);

  const renderCard = ({ item }: { item: Assessment }) => (
    <TouchableOpacity
      testID={`test-card-${item.id}`}
      activeOpacity={0.7}
      onPress={() => router.push(`/zelftesten/${item.id}` as any)}
      style={[
        styles.card,
        { backgroundColor: palette.surfaceElevated, borderColor: palette.borderDefault },
      ]}
    >
      <CategoryIcon category={item.category} size={40} iconSize={18} />
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: palette.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.freeTier && (
            <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}>
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]} numberOfLines={1}>
          {item.subtitle}
        </Text>
        <Text style={[styles.cardMeta, { color: palette.textMuted }]} numberOfLines={1}>
          {item.questionCount} vragen · {item.estimatedMinutes} min
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={palette.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="zelftesten-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Zelftesten</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.subtitleWrap}>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          24 gevalideerde screeners. Indicatie, geen diagnose.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        {CATEGORIES.map((c) => {
          const active = filter === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              testID={`category-chip-${c.id}`}
              onPress={() => setFilter(c.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? palette.accentSoft : palette.surfaceElevated,
                  borderColor: active ? palette.accent : palette.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? palette.accent : palette.textMuted },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
        showsVerticalScrollIndicator={false}
      />

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
  title: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  subtitleWrap: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  subtitle: {
    fontSize: 13,
  },
  chipsScroll: {
    maxHeight: 44,
  },
  chipsRow: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    gap: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 14.5,
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
  cardSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11.5,
    marginTop: 4,
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
});
