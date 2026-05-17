import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

import { useTheme } from "@/src/theme/ThemeContext";
import { communityApi, CommunityMe, CommunityThread } from "@/src/api/community";
import { PlusModal } from "@/src/components/PlusModal";

function relative(iso?: string) {
  if (!iso) return "net";
  const mins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function CommunityInboxScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const [me, setMe] = useState<CommunityMe | null>(null);
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlus, setShowPlus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, inboxRes] = await Promise.all([communityApi.me(), communityApi.inbox()]);
      setMe(meRes);
      setThreads(inboxRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}> 
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}> 
        <TouchableOpacity testID="community-inbox-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Inbox</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.accent} />
        </View>
      ) : !me?.can_dm ? (
        <View style={styles.centerBox}>
          <Text style={[styles.lockTitle, { color: palette.textPrimary }]}>Inbox is Plus</Text>
          <Text style={[styles.lockBody, { color: palette.textMuted }]}>Met Plus kan je anoniem contact leggen via DM.</Text>
          <TouchableOpacity testID="community-inbox-plus-cta" onPress={() => setShowPlus(true)} style={[styles.plusBtn, { backgroundColor: palette.accent }]}> 
            <Text style={styles.plusBtnText}>Ontgrendel Plus</Text>
          </TouchableOpacity>
        </View>
      ) : !threads.length ? (
        <View style={styles.centerBox}>
          <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>Nog geen gesprekken</Text>
          <Text style={[styles.emptyBody, { color: palette.textMuted }]}>Open een post in de community en tik op Contact.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {threads.map((t) => (
            <TouchableOpacity
              key={t.peer_nickname}
              testID={`community-inbox-thread-${t.peer_nickname}`}
              onPress={() => router.push(`/community/${encodeURIComponent(t.peer_nickname)}` as any)}
              style={[styles.threadCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}
            >
              <View style={styles.threadHead}>
                <Text style={[styles.peer, { color: palette.textPrimary }]}>@{t.peer_nickname}</Text>
                <Text style={[styles.meta, { color: palette.textFaint }]}>{relative(t.last_at)}</Text>
              </View>
              <Text numberOfLines={1} style={[styles.preview, { color: palette.textSecondary }]}>{t.last_message}</Text>
              {!!t.unread && (
                <View style={[styles.unreadChip, { backgroundColor: palette.accent }]}> 
                  <Text style={styles.unreadText}>{t.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <PlusModal visible={showPlus} reason="community" onClose={() => setShowPlus(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    height: 56,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14.5, fontWeight: "600" },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  lockTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  lockBody: { fontSize: 13.5, lineHeight: 20, textAlign: "center", marginBottom: 14 },
  plusBtn: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  plusBtnText: { color: "#0a0a0a", fontWeight: "700", fontSize: 13 },
  emptyTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  emptyBody: { fontSize: 12.5, textAlign: "center" },
  body: { padding: 12, gap: 8, paddingBottom: 24 },
  threadCard: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
  },
  threadHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  peer: { fontSize: 13.5, fontWeight: "700" },
  meta: { fontSize: 11.5 },
  preview: { fontSize: 12.5 },
  unreadChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 999,
    minWidth: 20,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: { color: "#0a0a0a", fontSize: 11.5, fontWeight: "700" },
});
