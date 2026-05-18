import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useTheme } from "@/src/theme/ThemeContext";
import { communityApi, CommunityDM, CommunityMe } from "@/src/api/community";
import { PlusModal } from "@/src/components/PlusModal";

export default function CommunityDMThreadScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ peer?: string }>();
  const peer = useMemo(() => decodeURIComponent((params.peer as string) || ""), [params.peer]);

  const [me, setMe] = useState<CommunityMe | null>(null);
  const [messages, setMessages] = useState<CommunityDM[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [showPlus, setShowPlus] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!peer) return;
    setErr(null);
    try {
      const [meRes, threadRes] = await Promise.all([communityApi.me(), communityApi.thread(peer)]);
      setMe(meRes);
      setMessages(threadRes);
    } catch (e: any) {
      setErr(e?.message ?? "DM laden mislukt");
    } finally {
      setLoading(false);
    }
  }, [peer]);

  useEffect(() => {
    load();
  }, [load]);

  const send = useCallback(async () => {
    if (!peer || !draft.trim() || sending) return;
    if (!me?.can_dm) {
      setShowPlus(true);
      return;
    }
    setSending(true);
    try {
      const res = await communityApi.sendDM(peer, draft.trim());
      setMessages((prev) => [...prev, res.message]);
      setDraft("");
    } catch (e: any) {
      setErr(e?.message ?? "DM versturen mislukt");
    } finally {
      setSending(false);
    }
  }, [peer, draft, sending, me?.can_dm]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}> 
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}> 
        <TouchableOpacity testID="community-dm-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: palette.textPrimary }]}>DM met @{peer}</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>Volledig anoniem</Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.accent} />
        </View>
      ) : !me?.can_dm ? (
        <View style={styles.centerBox}>
          <Text style={[styles.lockTitle, { color: palette.textPrimary }]}>DM is Plus</Text>
          <Text style={[styles.lockBody, { color: palette.textMuted }]}>Free gebruikers kunnen meelezen in community. Met Plus kan je contact leggen via DM.</Text>
          <TouchableOpacity
            testID="community-dm-plus-cta"
            style={[styles.plusBtn, { backgroundColor: palette.accent }]}
            onPress={() => setShowPlus(true)}
          >
            <Text style={styles.plusBtnText}>Ontgrendel Plus</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.threadBody}>
            {messages.map((m) => {
              const mine = m.from_nickname === me.nickname;
              return (
                <View
                  key={m.id}
                  testID={`community-dm-message-${m.id}`}
                  style={[
                    styles.msgBubble,
                    mine
                      ? { alignSelf: "flex-end", backgroundColor: palette.accentSoft, borderColor: palette.accent }
                      : { alignSelf: "flex-start", backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
                  ]}
                >
                  <Text style={[styles.msgAuthor, { color: palette.textMuted }]}>{mine ? "Jij" : `@${m.from_nickname}`}</Text>
                  <Text style={[styles.msgText, { color: palette.textPrimary }]}>{m.text}</Text>
                </View>
              );
            })}
            {!messages.length ? (
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>Nog geen berichten. Stuur een eerste anoniem bericht.</Text>
            ) : null}
          </ScrollView>

          <View style={[styles.inputBar, { borderTopColor: palette.borderSubtle, backgroundColor: palette.surfaceElevated }]}> 
            <TextInput
              testID="community-dm-input"
              value={draft}
              onChangeText={setDraft}
              placeholder="Typ je bericht..."
              placeholderTextColor={palette.textFaint}
              style={[styles.input, { color: palette.textPrimary, borderColor: palette.borderDefault }]}
            />
            <TouchableOpacity
              testID="community-dm-send"
              onPress={send}
              disabled={sending || !draft.trim()}
              style={[styles.sendBtn, { backgroundColor: palette.accent, opacity: sending || !draft.trim() ? 0.65 : 1 }]}
            >
              {sending ? <ActivityIndicator size="small" color="#ffffff" /> : <Feather name="send" size={15} color="#ffffff" />}
            </TouchableOpacity>
          </View>
        </>
      )}

      {err ? <Text style={[styles.err, { color: "#ef4444" }]}>{err}</Text> : null}

      <PlusModal visible={showPlus} reason="community" onClose={() => setShowPlus(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  titleWrap: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600" },
  subtitle: { fontSize: 11.5, marginTop: 2 },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  lockTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  lockBody: { fontSize: 13.5, lineHeight: 20, textAlign: "center", marginBottom: 16 },
  plusBtn: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  plusBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  threadBody: { padding: 12, gap: 8, paddingBottom: 24 },
  msgBubble: {
    maxWidth: "84%",
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  msgAuthor: { fontSize: 10.5 },
  msgText: { fontSize: 13.5, lineHeight: 19 },
  emptyText: { fontSize: 12.5, textAlign: "center", marginTop: 24 },
  inputBar: {
    borderTopWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  err: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    fontSize: 12,
  },
});
