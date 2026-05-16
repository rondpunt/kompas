// Kompas Beheerconsole — stub.
// Achteraf uit te bouwen tot volledige admin UI.
// Toegang via ADMIN_TOKEN (X-Admin-Token header).
//
// Backend endpoints reeds beschikbaar:
//   GET /api/admin/overview             — totalen + recente activiteit
//   GET /api/admin/conversations        — alle gesprekken (paginated)
//   GET /api/admin/conversations/{id}   — gesprek + alle berichten
//   GET /api/admin/assessment-results   — alle test-resultaten (incl. raw answers)

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";

interface Overview {
  totals: {
    conversations: number;
    messages: number;
    assessment_results: number;
  };
  recent_conversations: any[];
  recent_assessment_results: any[];
}

export default function AdminConsole() {
  const { palette } = useTheme();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/overview`, {
        headers: { "X-Admin-Token": token },
      });
      if (!r.ok) {
        if (r.status === 401) throw new Error("Ongeldig token");
        throw new Error(`HTTP ${r.status}`);
      }
      const json: Overview = await r.json();
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="admin-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Beheerconsole</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {!data && (
          <View style={[styles.box, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
            <Text style={[styles.label, { color: palette.textMuted }]}>Admin token</Text>
            <TextInput
              testID="admin-token-input"
              value={token}
              onChangeText={setToken}
              placeholder="X-Admin-Token"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: palette.textPrimary, borderColor: palette.borderDefault }]}
            />
            <TouchableOpacity
              testID="admin-load"
              onPress={load}
              disabled={loading || !token}
              style={[styles.cta, { backgroundColor: palette.textPrimary, opacity: !token ? 0.5 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color={palette.inversePrimary} size="small" />
              ) : (
                <Text style={[styles.ctaText, { color: palette.inversePrimary }]}>Inloggen</Text>
              )}
            </TouchableOpacity>
            {error && (
              <Text style={[styles.errText, { color: palette.danger }]}>{error}</Text>
            )}
            <Text style={[styles.hint, { color: palette.textMuted }]}>
              Volledige beheerconsole — chats, zelftesten, totalen — wordt later uitgebouwd. Backend-endpoints zijn klaar.
            </Text>
          </View>
        )}

        {data && (
          <View>
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>TOTALEN</Text>
            <View style={[styles.box, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              <Row label="Gesprekken" value={String(data.totals.conversations)} palette={palette} />
              <Row label="Berichten" value={String(data.totals.messages)} palette={palette} />
              <Row label="Test-resultaten" value={String(data.totals.assessment_results)} palette={palette} />
            </View>

            <Text style={[styles.sectionLabel, { color: palette.textMuted, marginTop: 22 }]}>
              RECENTE GESPREKKEN
            </Text>
            <View style={[styles.box, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              {data.recent_conversations.map((c: any) => (
                <View key={c.id} style={[styles.recentRow, { borderBottomColor: palette.borderSubtle }]}>
                  <Text style={[styles.recentTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                    {c.title || "Nieuw gesprek"}
                  </Text>
                  <Text style={[styles.recentMeta, { color: palette.textMuted }]} numberOfLines={1}>
                    {new Date(c.updated_at).toLocaleString("nl-BE")}
                  </Text>
                </View>
              ))}
              {data.recent_conversations.length === 0 && (
                <Text style={[styles.empty, { color: palette.textMuted }]}>Geen gesprekken</Text>
              )}
            </View>

            <Text style={[styles.sectionLabel, { color: palette.textMuted, marginTop: 22 }]}>
              RECENTE TEST-RESULTATEN
            </Text>
            <View style={[styles.box, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              {data.recent_assessment_results.map((r: any) => (
                <View key={r.id} style={[styles.recentRow, { borderBottomColor: palette.borderSubtle }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                      {r.assessment_title}
                    </Text>
                    <Text style={[styles.recentMeta, { color: palette.textMuted }]} numberOfLines={1}>
                      {r.total_score}/{r.max_score} · {r.interpretation_label} ·{" "}
                      {new Date(r.completed_at).toLocaleString("nl-BE")}
                    </Text>
                  </View>
                </View>
              ))}
              {data.recent_assessment_results.length === 0 && (
                <Text style={[styles.empty, { color: palette.textMuted }]}>Geen resultaten</Text>
              )}
            </View>

            <TouchableOpacity
              testID="admin-logout"
              onPress={() => {
                setData(null);
                setToken("");
              }}
              style={[styles.secondary, { borderColor: palette.borderDefault, marginTop: 20 }]}
            >
              <Text style={[styles.secondaryText, { color: palette.textPrimary }]}>Uitloggen</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, palette }: any) {
  return (
    <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
      <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: palette.textPrimary }]}>{value}</Text>
    </View>
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
  title: { fontSize: 15, fontWeight: "500" },
  body: { padding: 16, paddingBottom: 80 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  box: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  label: { fontSize: 11, fontWeight: "500", letterSpacing: 0.5, marginBottom: 8 },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  cta: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontSize: 14, fontWeight: "500" },
  secondary: {
    height: 44,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 14, fontWeight: "500" },
  errText: { fontSize: 13, marginTop: 12, textAlign: "center" },
  hint: { fontSize: 12, marginTop: 14, lineHeight: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: "500" },
  recentRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  recentTitle: { fontSize: 14, fontWeight: "500" },
  recentMeta: { fontSize: 11.5, marginTop: 2 },
  empty: { fontSize: 13, textAlign: "center", paddingVertical: 12 },
});
