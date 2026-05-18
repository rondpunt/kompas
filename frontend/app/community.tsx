import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { BRAND } from "@/src/theme/tokens";

const CHANNELS = [
  { id: "adhd", icon: "zap", label: "ADHD", color: BRAND.yellow, desc: "Focus, structuur en energie" },
  { id: "angst", icon: "wind", label: "Angst", color: BRAND.blue, desc: "Overpeinzing en piekeren" },
  { id: "depressie", icon: "cloud", label: "Stemming", color: BRAND.coral, desc: "Neerslachtigheid en vermoeidheid" },
  { id: "autisme", icon: "grid", label: "Autisme", color: BRAND.green, desc: "Prikkels, structuur en verbinding" },
  { id: "relaties", icon: "heart", label: "Relaties", color: BRAND.orange, desc: "Hechtingsstijl en communicatie" },
  { id: "werk", icon: "briefcase", label: "Werk & Burnout", color: BRAND.blue, desc: "Grenzen stellen en herstellen" },
] as const;

const POSTS = [
  { id: "1", channel: "ADHD", time: "3u", content: "Heeft iemand tips voor de overgang van werk naar privé? Mijn brein blijft gewoon doorgaan...", replies: 12, color: BRAND.yellow },
  { id: "2", channel: "Angst", time: "1u", content: "Ik probeer al weken het grounding-oefening maar vandaag hielp het echt. Klein moment van trots.", replies: 8, color: BRAND.blue },
  { id: "3", channel: "Stemming", time: "6u", content: "Bestaat er zoiets als 'te goed voelen' na een slechte periode? Ik weet niet goed wat ik moet doen met het gevoel.", replies: 21, color: BRAND.coral },
] as const;

export default function Community() {
  const { palette } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]}>Gemeenschap</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: BRAND.coralAlpha15, borderColor: BRAND.coralAlpha25 }]}>
          <View style={[styles.heroIcon, { backgroundColor: BRAND.coral + '20' }]}>
            <Feather name="users" size={20} color={BRAND.coral} />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.heroTitle, { color: palette.textPrimary }]}>Anonieme gemeenschap</Text>
            <Text style={[styles.heroSub, { color: palette.textMuted }]}>Lees mee. Reageer anoniem. Geen echte namen.</Text>
          </View>
        </View>

        {/* Kanalen */}
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>KANALEN</Text>
        <View style={styles.channelGrid}>
          {CHANNELS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.channelCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle, borderTopColor: c.color, borderTopWidth: 2.5 }]}
              activeOpacity={0.75}
            >
              <View style={[styles.channelIcon, { backgroundColor: c.color + '18' }]}>
                <Feather name={c.icon as any} size={16} color={c.color} />
              </View>
              <Text style={[styles.channelLabel, { color: palette.textPrimary }]}>{c.label}</Text>
              <Text style={[styles.channelDesc, { color: palette.textMuted }]}>{c.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent */}
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>RECENT</Text>
        <View style={styles.posts}>
          {POSTS.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.postCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]} activeOpacity={0.75}>
              <View style={styles.postHeader}>
                <View style={[styles.postChannel, { backgroundColor: p.color + '18' }]}>
                  <Text style={[styles.postChannelText, { color: p.color }]}>{p.channel}</Text>
                </View>
                <Text style={[styles.postTime, { color: palette.textFaint }]}>{p.time} geleden</Text>
              </View>
              <Text style={[styles.postContent, { color: palette.textSecondary }]} numberOfLines={3}>{p.content}</Text>
              <View style={styles.postFooter}>
                <Feather name="message-circle" size={13} color={palette.textMuted} />
                <Text style={[styles.postReplies, { color: palette.textMuted }]}>{p.replies} reacties</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plus CTA */}
        <View style={[styles.plusCard, { backgroundColor: BRAND.blueAlpha08, borderColor: BRAND.blueAlpha25 }]}>
          <Feather name="zap" size={16} color={BRAND.blue} />
          <View style={styles.plusCardText}>
            <Text style={[styles.plusCardTitle, { color: palette.textPrimary }]}>Post als Plus-lid</Text>
            <Text style={[styles.plusCardSub, { color: palette.textMuted }]}>Upgrade om anoniem te posten en te reageren</Text>
          </View>
          <View style={[styles.plusBadge, { backgroundColor: BRAND.blue }]}>
            <Text style={styles.plusBadgeText}>PLUS</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { height: 48, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 15, fontWeight: "500" },
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 0 },
  hero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, borderWidth: 0.5, marginBottom: 24 },
  heroIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  heroSub: { fontSize: 13, lineHeight: 18 },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 },
  channelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  channelCard: {
    width: "47%", borderRadius: 14, padding: 14, gap: 8, borderWidth: 0.5,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 1 } }),
  },
  channelIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  channelLabel: { fontSize: 14, fontWeight: "600" },
  channelDesc: { fontSize: 11.5, lineHeight: 16 },
  posts: { gap: 10, marginBottom: 20 },
  postCard: {
    borderRadius: 14, padding: 14, gap: 10, borderWidth: 0.5,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 1 } }),
  },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  postChannel: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  postChannelText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  postTime: { fontSize: 11.5, flex: 1, textAlign: "right" },
  postContent: { fontSize: 13.5, lineHeight: 20 },
  postFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  postReplies: { fontSize: 12 },
  plusCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 0.5 },
  plusCardText: { flex: 1 },
  plusCardTitle: { fontSize: 14, fontWeight: "600" },
  plusCardSub: { fontSize: 12.5, marginTop: 1 },
  plusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  plusBadgeText: { color: "#fff", fontSize: 9.5, fontWeight: "700", letterSpacing: 0.4 },
});
