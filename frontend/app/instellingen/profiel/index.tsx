import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { profileApi, ProfileFetchResponse } from "@/src/api/profile";
import { SECTIONS } from "@/src/data/profileSections";

function ProgressRing({ pct, tint, palette, size = 28 }: { pct: number; tint: string; palette: any; size?: number }) {
  // Simple bar fallback (rings need SVG); show a thin horizontal bar above.
  return (
    <View style={[styles.ringTrack, { width: size + 24, backgroundColor: palette.surfaceHigher }]}>
      <View
        style={[
          styles.ringFill,
          {
            width: `${Math.round(pct * 100)}%`,
            backgroundColor: tint,
          },
        ]}
      />
    </View>
  );
}

export default function ProfielIndex() {
  const { palette } = useTheme();
  const router = useRouter();
  const [data, setData] = useState<ProfileFetchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      const res = await profileApi.get();
      setData(res);
    } catch (e: any) {
      setErr(e?.message ?? "laden mislukt");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Reload when returning from a section editor
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const overall = data?.overall_completion ?? 0;

  const confirmDelete = () => {
    Alert.alert(
      "Profiel wissen?",
      "Alle profielvelden worden verwijderd. Je gesprekken blijven bewaard.",
      [
        { text: "Annuleer", style: "cancel" },
        {
          text: "Wissen",
          style: "destructive",
          onPress: async () => {
            try {
              await profileApi.deleteAll();
              await load();
            } catch (e) {
              console.warn(e);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="profile-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]}>Profiel</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
            ]}
          >
            <Text
              style={[
                styles.heroTitle,
                {
                  color: palette.textPrimary,
                  fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
                },
              ]}
            >
              Hoe meer Kompas jou kent,{"\n"}hoe scherper de gesprekken.
            </Text>
            <Text style={[styles.heroBody, { color: palette.textSecondary }]}>
              Verschijnt nooit ergens anders. Wordt enkel gebruikt om met jou af te stemmen — geen letterlijke verwijzing.
            </Text>
            <View style={styles.overallRow}>
              <Text style={[styles.overallLabel, { color: palette.textMuted }]}>
                In totaal ingevuld
              </Text>
              <Text style={[styles.overallPct, { color: palette.accent }]}>
                {Math.round(overall * 100)}%
              </Text>
            </View>
            <View style={[styles.overallBarTrack, { backgroundColor: palette.surfaceHigher }]}>
              <View
                style={[
                  styles.overallBarFill,
                  { width: `${Math.round(overall * 100)}%`, backgroundColor: palette.accent },
                ]}
              />
            </View>
          </View>

          {err && (
            <Text style={[styles.errText, { color: palette.danger }]}>{err}</Text>
          )}

          {/* Sections */}
          {SECTIONS.map((s) => {
            const pct = data?.completion?.[s.key] ?? 0;
            return (
              <TouchableOpacity
                key={s.key}
                testID={`profile-section-${s.key}`}
                activeOpacity={0.75}
                onPress={() => router.push(`/instellingen/profiel/${s.key}` as any)}
                style={[
                  styles.row,
                  {
                    backgroundColor: palette.surfaceElevated,
                    borderColor: palette.borderSubtle,
                  },
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: s.tintSoft, borderColor: s.tint + "55" }]}>
                  <Feather name={s.icon} size={16} color={s.tint} />
                </View>
                <View style={styles.rowBody}>
                  <View style={styles.rowTitleLine}>
                    <Text style={[styles.rowTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                      {s.title}
                    </Text>
                    {s.important && (
                      <View style={[styles.belangrijkChip, { borderColor: s.tint }]}>
                        <Text style={[styles.belangrijkText, { color: s.tint }]}>BELANGRIJK</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.rowSub, { color: palette.textMuted }]} numberOfLines={1}>
                    {s.subtitle}
                  </Text>
                  <ProgressRing pct={pct} tint={s.tint} palette={palette} />
                </View>
                <Feather name="chevron-right" size={16} color={palette.textMuted} />
              </TouchableOpacity>
            );
          })}

          {/* Privacy actions */}
          <View style={styles.privacyBlock}>
            <Text style={[styles.privacyHeader, { color: palette.textMuted }]}>
              PRIVACY
            </Text>
            <TouchableOpacity
              testID="profile-export"
              onPress={async () => {
                try {
                  const res = await profileApi.export();
                  Alert.alert(
                    "Profiel-export",
                    `${JSON.stringify(res.profile, null, 2).slice(0, 800)}…\n\n(Volledige JSON beschikbaar; live download komt later.)`,
                  );
                } catch (e) {
                  console.warn(e);
                }
              }}
              style={[styles.privacyRow, { borderTopColor: palette.borderSubtle, borderBottomColor: palette.borderSubtle }]}
            >
              <Feather name="download" size={15} color={palette.textPrimary} />
              <Text style={[styles.privacyRowText, { color: palette.textPrimary }]}>Exporteer mijn profiel</Text>
              <Feather name="chevron-right" size={14} color={palette.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="profile-delete"
              onPress={confirmDelete}
              style={[styles.privacyRow, { borderBottomColor: palette.borderSubtle }]}
            >
              <Feather name="trash-2" size={15} color={palette.danger} />
              <Text style={[styles.privacyRowText, { color: palette.danger }]}>Wis alle profielvelden</Text>
              <Feather name="chevron-right" size={14} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.foot, { color: palette.textFaint }]}>
            Wat je hier deelt, blijft van jou. Niets wordt doorverkocht of voor reclame gebruikt.
          </Text>
        </ScrollView>
      )}
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
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 15, fontWeight: "500" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  body: { padding: 16, paddingBottom: 40 },
  heroCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 18,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  overallLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
    fontWeight: "500",
  },
  overallPct: { fontSize: 18, fontWeight: "600" },
  overallBarTrack: { width: "100%", height: 4, borderRadius: 2, overflow: "hidden" },
  overallBarFill: { height: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderTopWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    gap: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitleLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowTitle: { fontSize: 14.5, fontWeight: "500", flexShrink: 1 },
  rowSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  ringTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
    marginTop: 6,
    width: "100%",
  },
  ringFill: {
    height: 3,
    borderRadius: 1.5,
  },
  belangrijkChip: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  belangrijkText: { fontSize: 8.5, fontWeight: "600", letterSpacing: 0.5 },
  privacyBlock: { marginTop: 22 },
  privacyHeader: {
    fontSize: 11,
    letterSpacing: 0.6,
    fontWeight: "500",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 10,
    borderBottomWidth: 0.5,
  },
  privacyRowText: { flex: 1, fontSize: 14 },
  foot: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 22,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  errText: { fontSize: 12, marginBottom: 8 },
});
