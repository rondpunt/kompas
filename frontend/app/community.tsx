import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { PlusModal } from "@/src/components/PlusModal";

interface Channel {
  id: string;
  label: string;
  hint: string;
  iconLib: "Feather" | "MaterialCommunityIcons";
  iconName: string;
  bgNight: string;
  fgNight: string;
}

const CHANNELS: Channel[] = [
  { id: "adhd", label: "ADHD", hint: "Concentratie, prikkels, ritme", iconLib: "Feather", iconName: "zap", bgNight: "#581c87", fgNight: "#d8b4fe" },
  { id: "autisme", label: "Autisme", hint: "Patronen, sociaal, prikkels", iconLib: "Feather", iconName: "layers", bgNight: "#134e4a", fgNight: "#5eead4" },
  { id: "burnout", label: "Burn-out", hint: "Werk, herstellen, grenzen", iconLib: "Feather", iconName: "battery", bgNight: "#7c2d12", fgNight: "#fdba74" },
  { id: "depressie", label: "Depressie", hint: "Donkere periodes, motivatie", iconLib: "Feather", iconName: "cloud-rain", bgNight: "#451a03", fgNight: "#fcd34d" },
  { id: "angst", label: "Angst", hint: "Piekeren, paniek, ademen", iconLib: "Feather", iconName: "wind", bgNight: "#1e3a8a", fgNight: "#93c5fd" },
  { id: "hsp", label: "Hooggevoelig", hint: "Prikkels, energie, rust", iconLib: "Feather", iconName: "feather", bgNight: "#831843", fgNight: "#f9a8d4" },
  { id: "verlies", label: "Verlies", hint: "Rouw, gemis, herinneren", iconLib: "MaterialCommunityIcons", iconName: "weather-cloudy", bgNight: "#1f2937", fgNight: "#d1d5db" },
  { id: "relaties", label: "Relaties", hint: "Partner, ouders, vrienden", iconLib: "Feather", iconName: "users", bgNight: "#1e40af", fgNight: "#bfdbfe" },
];

export default function Community() {
  const { palette } = useTheme();
  const router = useRouter();
  const [showPlus, setShowPlus] = useState(false);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="community-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]}>Gemeenschap</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.heroCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
          <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}>
            <Feather name="zap" size={10} color="#0a0a0a" />
            <Text style={styles.plusBadgeText}>PLUS · BINNENKORT</Text>
          </View>
          <Text
            style={[
              styles.heroTitle,
              { color: palette.textPrimary, fontFamily: Platform.select({ ios: "Georgia", android: "serif" }) },
            ]}
          >
            Praat met mensen die ‘t snappen
          </Text>
          <Text style={[styles.heroBody, { color: palette.textSecondary }]}>
            Anonieme thema-kanalen. Geen echte namen, geen foto’s — gewoon ervaring delen met mensen die hetzelfde meemaken.
          </Text>
          <TouchableOpacity
            testID="community-cta"
            onPress={() => setShowPlus(true)}
            style={[styles.heroCta, { backgroundColor: palette.accent }]}
          >
            <Text style={styles.heroCtaText}>Houd me op de hoogte</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>KANALEN</Text>

        <View style={styles.grid}>
          {CHANNELS.map((c) => (
            <TouchableOpacity
              key={c.id}
              testID={`community-channel-${c.id}`}
              onPress={() => setShowPlus(true)}
              style={[
                styles.cell,
                { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
              ]}
            >
              <View style={[styles.cellIcon, { backgroundColor: c.bgNight }]}>
                {c.iconLib === "Feather" ? (
                  <Feather name={c.iconName as any} size={18} color={c.fgNight} />
                ) : (
                  <MaterialCommunityIcons name={c.iconName as any} size={18} color={c.fgNight} />
                )}
              </View>
              <Text style={[styles.cellLabel, { color: palette.textPrimary }]}>{c.label}</Text>
              <Text style={[styles.cellHint, { color: palette.textMuted }]} numberOfLines={1}>
                {c.hint}
              </Text>
              <View style={[styles.lockChip, { borderColor: palette.borderEmphasis }]}>
                <Feather name="lock" size={9} color={palette.textMuted} />
                <Text style={[styles.lockChipText, { color: palette.textMuted }]}>Plus</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.privacyNote, { color: palette.textMuted }]}>
          Anoniem handle per kanaal. Modereerd door Kompas. Niets wordt gedeeld buiten deze app.
        </Text>
      </ScrollView>

      <PlusModal visible={showPlus} reason="community" onClose={() => setShowPlus(false)} />
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
  body: { padding: 16, paddingBottom: 40 },
  heroCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 18,
    marginBottom: 22,
  },
  plusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 14,
  },
  plusBadgeText: {
    color: "#0a0a0a",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 28,
    marginBottom: 8,
  },
  heroBody: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroCta: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCtaText: {
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  cell: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    minHeight: 120,
  },
  cellIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cellLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  cellHint: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  lockChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  lockChipText: {
    fontSize: 9.5,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  privacyNote: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 6,
  },
});
