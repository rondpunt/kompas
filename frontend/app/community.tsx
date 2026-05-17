import React, { useMemo, useState } from "react";
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
  members: string;
  sampleActivity: string;
  iconLib: "Feather" | "MaterialCommunityIcons";
  iconName: string;
  bgNight: string;
  fgNight: string;
}

const CHANNELS: Channel[] = [
  { id: "adhd", label: "ADHD", hint: "Concentratie, prikkels, ritme", members: "1.2k", sampleActivity: "36 nieuwe posts vandaag", iconLib: "Feather", iconName: "zap", bgNight: "#581c87", fgNight: "#d8b4fe" },
  { id: "autisme", label: "Autisme", hint: "Patronen, sociaal, prikkels", members: "890", sampleActivity: "22 nieuwe posts vandaag", iconLib: "Feather", iconName: "layers", bgNight: "#134e4a", fgNight: "#5eead4" },
  { id: "burnout", label: "Burn-out", hint: "Werk, herstellen, grenzen", members: "1.5k", sampleActivity: "41 nieuwe posts vandaag", iconLib: "Feather", iconName: "battery", bgNight: "#7c2d12", fgNight: "#fdba74" },
  { id: "depressie", label: "Depressie", hint: "Donkere periodes, motivatie", members: "2.1k", sampleActivity: "57 nieuwe posts vandaag", iconLib: "Feather", iconName: "cloud-rain", bgNight: "#451a03", fgNight: "#fcd34d" },
  { id: "angst", label: "Angst", hint: "Piekeren, paniek, ademen", members: "1.8k", sampleActivity: "49 nieuwe posts vandaag", iconLib: "Feather", iconName: "wind", bgNight: "#1e3a8a", fgNight: "#93c5fd" },
  { id: "hsp", label: "Hooggevoelig", hint: "Prikkels, energie, rust", members: "640", sampleActivity: "17 nieuwe posts vandaag", iconLib: "Feather", iconName: "feather", bgNight: "#831843", fgNight: "#f9a8d4" },
  { id: "verlies", label: "Verlies", hint: "Rouw, gemis, herinneren", members: "720", sampleActivity: "14 nieuwe posts vandaag", iconLib: "MaterialCommunityIcons", iconName: "weather-cloudy", bgNight: "#1f2937", fgNight: "#d1d5db" },
  { id: "relaties", label: "Relaties", hint: "Partner, ouders, vrienden", members: "1.0k", sampleActivity: "29 nieuwe posts vandaag", iconLib: "Feather", iconName: "users", bgNight: "#1e40af", fgNight: "#bfdbfe" },
];

const FILTERS = [
  { id: "all", label: "Alles" },
  { id: "stress", label: "Stress" },
  { id: "werk", label: "Werk" },
  { id: "relaties", label: "Relaties" },
  { id: "diagnose", label: "Diagnose" },
] as const;

export default function Community() {
  const { palette } = useTheme();
  const router = useRouter();
  const [showPlus, setShowPlus] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const shownChannels = useMemo(() => {
    if (activeFilter === "all") return CHANNELS;
    if (activeFilter === "relaties") return CHANNELS.filter((c) => c.id === "relaties");
    if (activeFilter === "werk") return CHANNELS.filter((c) => c.id === "burnout");
    if (activeFilter === "stress") return CHANNELS.filter((c) => c.id === "angst" || c.id === "hsp");
    return CHANNELS.filter((c) => c.id !== "relaties");
  }, [activeFilter]);

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
          <View style={styles.heroGlow} />
          <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}> 
            <Feather name="moon" size={10} color="#0a0a0a" />
            <Text style={styles.plusBadgeText}>BETA · READ-ONLY</Text>
          </View>
          <Text
            style={[
              styles.heroTitle,
              { color: palette.textPrimary, fontFamily: Platform.select({ ios: "Georgia", android: "serif" }) },
            ]}
          >
            Community die echt begrijpt{"\n"}wat je meemaakt
          </Text>
          <Text style={[styles.heroBody, { color: palette.textSecondary }]}>
            Warm en veilig in dark mode. Anonieme thema-kanalen, gemodereerd en rustig opgebouwd.
            Gratis gebruikers kunnen nu al meelezen in voorbeeldthreads.
          </Text>
          <View style={styles.heroFacts}>
            <View style={[styles.heroFactPill, { borderColor: palette.borderDefault }]}>
              <Feather name="shield" size={11} color={palette.textMuted} />
              <Text style={[styles.heroFactText, { color: palette.textMuted }]}>Anoniem</Text>
            </View>
            <View style={[styles.heroFactPill, { borderColor: palette.borderDefault }]}>
              <Feather name="eye-off" size={11} color={palette.textMuted} />
              <Text style={[styles.heroFactText, { color: palette.textMuted }]}>Geen profielen</Text>
            </View>
            <View style={[styles.heroFactPill, { borderColor: palette.borderDefault }]}>
              <Feather name="check-circle" size={11} color={palette.textMuted} />
              <Text style={[styles.heroFactText, { color: palette.textMuted }]}>Gemodereerd</Text>
            </View>
          </View>
          <TouchableOpacity
            testID="community-cta"
            onPress={() => setShowPlus(true)}
            style={[styles.heroCta, { backgroundColor: palette.accent }]}
          >
            <Text style={styles.heroCtaText}>Ontgrendel Plus Community</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>FILTER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                testID={`community-filter-${f.id}`}
                onPress={() => setActiveFilter(f.id)}
                style={[
                  styles.filterPill,
                  {
                    borderColor: active ? palette.accent : palette.borderSubtle,
                    backgroundColor: active ? palette.accentSoft : palette.surfaceElevated,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: active ? palette.textPrimary : palette.textMuted }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>KANALEN</Text>

        <View style={styles.list}>
          {shownChannels.map((c) => (
            <TouchableOpacity
              key={c.id}
              testID={`community-channel-${c.id}`}
              onPress={() => setShowPlus(true)}
              style={[
                styles.card,
                { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: c.bgNight }]}> 
                {c.iconLib === "Feather" ? (
                  <Feather name={c.iconName as any} size={18} color={c.fgNight} />
                ) : (
                  <MaterialCommunityIcons name={c.iconName as any} size={18} color={c.fgNight} />
                )}
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopLine}>
                  <Text style={[styles.cardLabel, { color: palette.textPrimary }]}>{c.label}</Text>
                  <View style={[styles.lockChip, { borderColor: palette.borderEmphasis }]}>
                    <Feather name="lock" size={9} color={palette.textMuted} />
                    <Text style={[styles.lockChipText, { color: palette.textMuted }]}>Read-only</Text>
                  </View>
                </View>
                <Text style={[styles.cardHint, { color: palette.textMuted }]} numberOfLines={1}>
                  {c.hint}
                </Text>
                <View style={styles.cardMetaRow}>
                  <Text style={[styles.cardMetaText, { color: palette.textFaint }]}>{c.members} leden</Text>
                  <View style={[styles.dot, { backgroundColor: palette.textFaint }]} />
                  <Text style={[styles.cardMetaText, { color: palette.textFaint }]}>{c.sampleActivity}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.guidelineCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
          <Text style={[styles.guidelineTitle, { color: palette.textPrimary }]}>Communityregels</Text>
          <View style={styles.ruleRow}>
            <Feather name="check" size={14} color={palette.accent} />
            <Text style={[styles.ruleText, { color: palette.textSecondary }]}>Respectvol en zonder diagnoses opdringen</Text>
          </View>
          <View style={styles.ruleRow}>
            <Feather name="check" size={14} color={palette.accent} />
            <Text style={[styles.ruleText, { color: palette.textSecondary }]}>Geen persoonlijke identiteitsgegevens delen</Text>
          </View>
          <View style={styles.ruleRow}>
            <Feather name="check" size={14} color={palette.accent} />
            <Text style={[styles.ruleText, { color: palette.textSecondary }]}>Kompas moderatie houdt het veilig en kalm</Text>
          </View>
          <TouchableOpacity testID="community-guidelines-cta" onPress={() => setShowPlus(true)} style={[styles.rulesCta, { borderColor: palette.borderDefault }]}> 
            <Text style={[styles.rulesCtaText, { color: palette.textPrimary }]}>Bekijk voorbeeldthread</Text>
            <Feather name="arrow-right" size={13} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.privacyNote, { color: palette.textMuted }]}> 
          Anoniem handle per kanaal. Geen echte namen of foto's. Voorlopig read-only voor gratis gebruikers.
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
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    right: -70,
    top: -90,
    borderRadius: 110,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  plusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  plusBadgeText: {
    color: "#0a0a0a",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 34,
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  heroFacts: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  heroFactPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroFactText: { fontSize: 11.5, fontWeight: "500" },
  heroCta: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCtaText: {
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  filterRow: { gap: 8, paddingRight: 10, marginBottom: 16 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.5,
    minHeight: 38,
    justifyContent: "center",
  },
  filterText: { fontSize: 12.5, fontWeight: "500" },
  list: { gap: 10, marginBottom: 18 },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardLabel: { fontSize: 15, fontWeight: "600" },
  cardHint: { fontSize: 12.5, marginTop: 2, marginBottom: 6 },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardMetaText: { fontSize: 11.5 },
  dot: { width: 3, height: 3, borderRadius: 2 },
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
    letterSpacing: 0.2,
  },
  guidelineCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 14,
  },
  guidelineTitle: { fontSize: 14.5, fontWeight: "600", marginBottom: 10 },
  ruleRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  ruleText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  rulesCta: {
    marginTop: 4,
    borderWidth: 0.5,
    borderRadius: 10,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rulesCtaText: { fontSize: 12.5, fontWeight: "600" },
  privacyNote: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 2,
  },
});
