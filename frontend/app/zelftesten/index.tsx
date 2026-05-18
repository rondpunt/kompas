import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
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

  const renderCard = ({ item, index }: { item: Assessment; index: number }) => (
    <TouchableOpacity
      testID={`test-card-${item.id}`}
      activeOpacity={0.65}
      onPress={() => router.push(`/zelftesten/${item.id}` as any)}
      style={[
        styles.card,
        {
          backgroundColor: palette.surfaceElevated,
          borderColor: palette.borderSubtle,
          shadowColor: "#000",
        },
      ]}
    >
      <CategoryIcon category={item.category} size={44} iconSize={20} />
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
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="help-circle" size={11} color={palette.textMuted} />
            <Text style={[styles.cardMeta, { color: palette.textMuted }]}>
              {item.questionCount} vragen
            </Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: palette.textFaint }]} />
          <View style={styles.metaItem}>
            <Feather name="clock" size={11} color={palette.textMuted} />
            <Text style={[styles.cardMeta, { color: palette.textMuted }]}>
              {item.estimatedMinutes} min
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.chevWrap, { backgroundColor: palette.surfaceHigher }]}>
        <Feather name="chevron-right" size={14} color={palette.textMuted} />
      </View>
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

      {/* Header hero */}
      <View style={styles.headerHero}>
        <Text
          style={[
            styles.heroTitle,
            {
              color: palette.textPrimary,
              fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
            },
          ]}
        >
          Wat ben je aan ‘t voelen?
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          24 gevalideerde screeners — indicatie, geen diagnose.
        </Text>
      </View>

      {/* Category chips — proper height so they don't get clipped */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((c) => {
            const active = filter === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                testID={`category-chip-${c.id}`}
                onPress={() => setFilter(c.id)}
                activeOpacity={0.75}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? palette.accent : palette.surfaceElevated,
                    borderColor: active ? palette.accent : palette.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? "#ffffff" : palette.textSecondary },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { borderTopColor: palette.borderSubtle, backgroundColor: palette.background }]}>
        <View style={styles.footerInner}>
          <Feather name="info" size={11} color={palette.textFaint} />
          <Text style={[styles.footerText, { color: palette.textFaint }]}>
            Indicatie — geen diagnose
          </Text>
        </View>
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
  headerHero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "500",
    fontStyle: "italic",
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  chipsContainer: {
    // No maxHeight — let it size naturally
    paddingBottom: 12,
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 7,
    alignItems: "center",
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1 },
    }),
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  plusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  plusBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  cardMeta: {
    fontSize: 11.5,
  },
  chevWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingVertical: 10,
    borderTopWidth: 0.5,
    alignItems: "center",
  },
  footerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 10.5,
    letterSpacing: 0.3,
  },
});
