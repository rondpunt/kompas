import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";

const THEME_OPTIONS = [
  { id: "night", label: "Night" },
  { id: "klaar", label: "Klaar" },
  { id: "system", label: "Systeem" },
] as const;

export default function Settings() {
  const { palette, mode, setMode } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="settings-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]}>Instellingen</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} testID="settings-body">
        {/* Account section */}
        <Section title="Account" palette={palette}>
          <Row label="Anoniem" palette={palette} testID="settings-account-row">
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>Geen e-mail</Text>
          </Row>
        </Section>

        {/* Subscription section */}
        <Section title="Abonnement" palette={palette}>
          <Row label="Huidige plan" palette={palette}>
            <View style={[styles.tierPill, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              <Text style={[styles.tierPillText, { color: palette.textPrimary }]}>Gratis</Text>
            </View>
          </Row>
          <TouchableOpacity testID="settings-upgrade" disabled style={[styles.upgradeBtn, { borderColor: palette.borderDefault, opacity: 0.7 }]}>
            <Feather name="zap" size={14} color={palette.accent} />
            <Text style={[styles.upgradeBtnText, { color: palette.textPrimary }]}>
              Probeer Kompas Plus — binnenkort
            </Text>
            <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}>
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </View>
          </TouchableOpacity>
        </Section>

        {/* Appearance section */}
        <Section title="Uiterlijk" palette={palette}>
          {THEME_OPTIONS.map((opt) => {
            const active = mode === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                testID={`settings-theme-${opt.id}`}
                onPress={() => setMode(opt.id)}
                style={[
                  styles.radioRow,
                  { borderBottomColor: palette.borderSubtle },
                ]}
              >
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>{opt.label}</Text>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: active ? palette.accent : palette.borderEmphasis },
                  ]}
                >
                  {active && <View style={[styles.radioInner, { backgroundColor: palette.accent }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </Section>

        {/* Language section */}
        <Section title="Taal" palette={palette}>
          <Row label="Taal" palette={palette}>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>Belgisch Nederlands</Text>
          </Row>
        </Section>

        {/* About section */}
        <Section title="Over" palette={palette}>
          <Row label="Versie" palette={palette}>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>1.0.0</Text>
          </Row>
          <Row label="Bron-inspiratie" palette={palette}>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>Borderline Times</Text>
          </Row>
        </Section>
      </ScrollView>

      <View style={[styles.disclaimerBar, { borderTopColor: palette.borderSubtle, backgroundColor: palette.background }]}>
        <Text style={[styles.disclaimerText, { color: palette.textMuted }]}>
          Kompas is geen vervanging voor professionele zorg. Bij crisis: bel 1813 (BE) of 113 (NL).
        </Text>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children, palette }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionBox, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
        {children}
      </View>
    </View>
  );
}

function Row({ label, children, palette, testID }: any) {
  return (
    <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]} testID={testID}>
      <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>{label}</Text>
      {children}
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
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  body: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionBox: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  rowLabel: {
    fontSize: 14.5,
  },
  rowValue: {
    fontSize: 13.5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  tierPillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderTopWidth: 0.5,
    borderTopColor: "transparent",
    paddingHorizontal: 14,
    gap: 10,
  },
  upgradeBtnText: {
    flex: 1,
    fontSize: 13.5,
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
  disclaimerBar: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  disclaimerText: {
    fontSize: 10.5,
    textAlign: "center",
    lineHeight: 14,
  },
});
