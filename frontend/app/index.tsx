import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { Wordmark, JunieLogo } from "@/src/components/JunieLogo";
import { Sidebar } from "@/src/components/Sidebar";
import { TestSuggestionPill } from "@/src/components/TestSuggestionPill";
import { SecureHandshake } from "@/src/components/SecureHandshake";
import { PlusHintBanner } from "@/src/components/PlusHintBanner";
import { PlusModal } from "@/src/components/PlusModal";
import { api, ApiMessage, ChatResponse } from "@/src/api/client";
import { profileApi } from "@/src/api/profile";
import { APP_NAME } from "@/src/config/branding";
import { hasOnboarded } from "./onboarding";
import { bumpMessageCount, dismissPlusHint, getUsage, UsageSnapshot } from "@/src/utils/usage";
import { storage } from "@/src/utils/storage";
import { BRAND } from "@/src/theme/tokens";

const SECURITY_SHOWN_KEY = "kompas.security.first_shown";
let coldLaunchHandshakeShown = false;

const QUICK_PROMPTS = [
  { id: "vandaag", icon: "sun", label: "Hoe ik me vandaag voel" },
  { id: "werk", icon: "briefcase", label: "Werk zit zwaar" },
  { id: "relatie", icon: "heart", label: "Iets in mijn relatie" },
  { id: "piekeren", icon: "wind", label: "Ik blijf maar piekeren" },
] as const;

// Junie typing indicator met de 3 merkkleuren
function TypingIndicator() {
  const dots = [BRAND.blue, BRAND.green, BRAND.yellow];
  const anims = dots.map(() => useRef(new Animated.Value(0.4)).current);
  useEffect(() => {
    const animations = anims.map((a, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 150),
        Animated.timing(a, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.4, duration: 300, useNativeDriver: true }),
      ]))
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);
  return (
    <View style={ti.wrap}>
      {dots.map((color, i) => (
        <Animated.View key={i} style={[ti.dot, { backgroundColor: color, opacity: anims[i] }]} />
      ))}
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 5, padding: 12, paddingHorizontal: 16, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 18, alignSelf: "flex-start" },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

type PendingProfileSuggestion = {
  id: string; field_path: string; value: string | number | boolean | string[];
  rationale?: string; question: string;
};

export default function ChatScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [handshakeVisible, setHandshakeVisible] = useState(!coldLaunchHandshakeShown);
  const [handshakeVariant, setHandshakeVariant] = useState<"full" | "short">("short");
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [showPlusModal, setShowPlusModal] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<PendingProfileSuggestion | null>(null);
  const [confirmingSuggestion, setConfirmingSuggestion] = useState<"accept" | "reject" | null>(null);
  const newChatToast = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const flashNewChat = useCallback(() => {
    Animated.sequence([
      Animated.timing(newChatToast, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(newChatToast, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [newChatToast]);

  const startNewChat = useCallback(() => {
    setConversationId(null); setMessages([]); setDraft(""); setPendingSuggestion(null);
    Keyboard.dismiss(); flashNewChat();
  }, [flashNewChat]);

  useEffect(() => {
    (async () => {
      const done = await hasOnboarded();
      if (!done) { router.replace("/onboarding"); return; }
      try {
        const seen = await storage.getItem<boolean>(SECURITY_SHOWN_KEY, false);
        setHandshakeVariant(seen ? "short" : "full");
      } catch { setHandshakeVariant("short"); }
      setOnboardingChecked(true);
      const u = await getUsage(); setUsage(u);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!conversationId) { setMessages([]); return; }
      try { const data = await api.getConversation(conversationId); setMessages(data.messages); } catch {}
    })();
  }, [conversationId]);

  const sendText = useCallback(async (text: string) => {
    if (!text || sending) return;
    setDraft(""); Keyboard.dismiss(); setSending(true);
    const optimisticUser: ApiMessage = { id: `tmp-${Date.now()}`, conversation_id: conversationId ?? "", role: "user", content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticUser]);
    try {
      const res: ChatResponse = await api.chat(text, conversationId ?? undefined);
      setConversationId(res.conversation_id);
      setMessages((prev) => {
        const withoutOpt = prev.filter((m) => m.id !== optimisticUser.id);
        return [...withoutOpt, res.user_message, res.assistant_message];
      });
      setPendingSuggestion((res.profile_suggestion as PendingProfileSuggestion | null) ?? null);
      await bumpMessageCount(); const u = await getUsage(); setUsage(u);
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, conversation_id: conversationId ?? "", role: "assistant", content: "Er ging iets mis. Probeer nog eens.", created_at: new Date().toISOString() }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [conversationId, sending]);

  const handleSend = useCallback(() => sendText(draft.trim()), [draft, sendText]);
  const handleQuickPrompt = useCallback((label: string) => sendText(label), [sendText]);
  const handleDismissPlusHint = useCallback(async () => { await dismissPlusHint(); setUsage(await getUsage()); }, []);

  const handleSuggestionDecision = useCallback(async (accept: boolean) => {
    if (!pendingSuggestion || confirmingSuggestion) return;
    setConfirmingSuggestion(accept ? "accept" : "reject");
    try {
      await profileApi.confirmSuggestion({ suggestion_id: pendingSuggestion.id, accept });
      setMessages((prev) => [...prev, { id: `sug-${Date.now()}`, conversation_id: conversationId ?? "", role: "assistant", content: accept ? "Top, toegevoegd aan je profiel." : "Goed, ik sla dit niet op.", created_at: new Date().toISOString() }]);
      setPendingSuggestion(null);
    } catch {
      setMessages((prev) => [...prev, { id: `sugerr-${Date.now()}`, conversation_id: conversationId ?? "", role: "assistant", content: "Dat lukte niet. Probeer nog eens.", created_at: new Date().toISOString() }]);
    } finally { setConfirmingSuggestion(null); }
  }, [pendingSuggestion, confirmingSuggestion, conversationId]);

  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60); }, [messages.length]);

  if (!onboardingChecked) return <View style={{ flex: 1, backgroundColor: palette.background }} />;

  const isEmpty = messages.length === 0;
  const hasText = draft.trim().length > 0;
  const showPlusHint = !!usage?.shouldShowPlusHint;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={["top", "bottom", "left", "right"]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]} testID="chat-topbar">
        <TouchableOpacity testID="chat-hamburger" onPress={() => setSidebarOpen(true)} style={styles.iconBtn}>
          <Feather name="menu" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Wordmark size={15} />
        <TouchableOpacity testID="chat-new-pencil" onPress={startNewChat} style={styles.iconBtn} activeOpacity={0.6}>
          <Feather name="edit-2" size={20} color={palette.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Nieuw gesprek toast */}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity: newChatToast, transform: [{ translateY: newChatToast.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
        <View style={[styles.toastInner, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
          <Feather name="check" size={12} color={palette.accent} />
          <Text style={[styles.toastText, { color: palette.textPrimary }]}>Nieuw gesprek</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Empty state */}
        {isEmpty ? (
          <ScrollView contentContainerStyle={styles.emptyState} showsVerticalScrollIndicator={false} testID="chat-empty">
            <View style={styles.emptyLogo}>
              <JunieLogo size={88} variant="mark" />
            </View>
            <Text style={[styles.emptyText, { color: palette.textPrimary }]}>Wat speelt er?</Text>
            <Text style={[styles.tagline, { color: palette.textMuted }]}>Zeg het gerust. Ik luister.</Text>
            <View style={styles.quickGrid}>
              {QUICK_PROMPTS.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  testID={`quick-${q.id}`}
                  onPress={() => handleQuickPrompt(q.label)}
                  activeOpacity={0.7}
                  style={[styles.quickChip, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}
                >
                  <Feather name={q.icon as any} size={14} color={palette.textMuted} />
                  <Text style={[styles.quickChipText, { color: palette.textPrimary }]} numberOfLines={1}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.privacyLine, { color: palette.textFaint }]}>
              Anoniem · Versleuteld · Niets wordt doorverkocht
            </Text>
          </ScrollView>
        ) : (
          <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} testID="chat-messages">
            {messages.map((m) => (
              <View key={m.id} style={[styles.msgWrap, m.role === "user" ? styles.userWrap : styles.assistantWrap]} testID={`message-${m.role}`}>
                {m.role === "user" ? (
                  <View style={styles.userBubble}>
                    <Text style={[styles.bodyText, { color: "#FFFFFF" }]}>{m.content}</Text>
                  </View>
                ) : (
                  <View style={styles.assistantBlock}>
                    <Text style={[styles.bodyText, { color: palette.textPrimary }]}>{m.content}</Text>
                    {m.suggested_test_id ? <TestSuggestionPill testId={m.suggested_test_id} /> : null}
                  </View>
                )}
              </View>
            ))}

            {/* Junie typing indicator */}
            {sending && (
              <View style={[styles.msgWrap, styles.assistantWrap]} testID="chat-typing">
                <TypingIndicator />
              </View>
            )}

            {/* Profile suggestion card */}
            {pendingSuggestion && (
              <View testID="chat-profile-suggestion-card" style={[styles.suggestionCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
                <Text style={[styles.suggestionLabel, { color: palette.accent }]}>Slim geheugenvoorstel</Text>
                <Text style={[styles.suggestionQuestion, { color: palette.textPrimary }]}>{pendingSuggestion.question}</Text>
                {pendingSuggestion.rationale && (
                  <Text style={[styles.suggestionRationale, { color: palette.textMuted }]}>Waarom: {pendingSuggestion.rationale}</Text>
                )}
                <View style={styles.suggestionActions}>
                  <TouchableOpacity testID="chat-profile-suggestion-reject" disabled={!!confirmingSuggestion} onPress={() => handleSuggestionDecision(false)} style={[styles.suggestionBtnGhost, { borderColor: palette.borderDefault, opacity: confirmingSuggestion ? 0.6 : 1 }]}>
                    <Text style={[styles.suggestionBtnGhostText, { color: palette.textPrimary }]}>Nee</Text>
                  </TouchableOpacity>
                  <TouchableOpacity testID="chat-profile-suggestion-accept" disabled={!!confirmingSuggestion} onPress={() => handleSuggestionDecision(true)} style={[styles.suggestionBtnPrimary, { backgroundColor: palette.accent, opacity: confirmingSuggestion ? 0.6 : 1 }]}>
                    {confirmingSuggestion === "accept" ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.suggestionBtnPrimaryText}>Ja, toevoegen</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {showPlusHint && !isEmpty && (
          <PlusHintBanner variant="chat" onPress={() => setShowPlusModal(true)} onDismiss={handleDismissPlusHint} />
        )}

        {/* Input area */}
        <View style={[styles.inputArea, { backgroundColor: palette.background }]}>
          <View style={[styles.inputPill, { backgroundColor: palette.surfaceElevated, borderColor: hasText ? palette.accent + "55" : palette.borderSubtle }]}>
            <TouchableOpacity testID="chat-attach" style={styles.inputIconBtn} disabled>
              <Feather name="plus" size={20} color={palette.textMuted} />
            </TouchableOpacity>
            <TextInput
              testID="chat-input"
              style={[styles.input, { color: palette.textPrimary }, Platform.OS === "web" ? ({ outlineStyle: "none", outline: "none" } as any) : null]}
              placeholder={`Bericht ${APP_NAME}`}
              placeholderTextColor={palette.textMuted}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={2000}
              editable={!sending}
              underlineColorAndroid="transparent"
              selectionColor={palette.accent}
            />
            {hasText ? (
              <TouchableOpacity testID="chat-send" onPress={handleSend} disabled={sending} activeOpacity={0.8} style={[styles.sendBtn, { backgroundColor: palette.accent }]}>
                {sending ? <ActivityIndicator size="small" color="#ffffff" /> : <Feather name="arrow-up" size={18} color="#ffffff" />}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity testID="chat-mic" style={styles.inputIconBtn} disabled>
                <Feather name="mic" size={18} color={palette.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.subActions}>
            <View style={styles.subActionItem}><Feather name="mic" size={12} color={palette.textMuted} /><Text style={[styles.subActionText, { color: palette.textMuted }]}>Spraak</Text></View>
            <View style={styles.subActionDot}><View style={[styles.dotMini, { backgroundColor: palette.textFaint }]} /></View>
            <View style={styles.subActionItem}><Feather name="camera" size={12} color={palette.textMuted} /><Text style={[styles.subActionText, { color: palette.textMuted }]}>Foto</Text></View>
            <View style={styles.subActionDot}><View style={[styles.dotMini, { backgroundColor: palette.textFaint }]} /></View>
            <TouchableOpacity testID="chat-quick-zelftest" onPress={() => router.push("/zelftesten")} style={styles.subActionItem}>
              <Feather name="check-square" size={12} color={palette.textMuted} />
              <Text style={[styles.subActionText, { color: palette.textMuted }]}>Zelftest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} currentConversationId={conversationId} onSelectConversation={(id) => setConversationId(id)} />

      {handshakeVisible && (
        <SecureHandshake variant={handshakeVariant} onComplete={async () => {
          coldLaunchHandshakeShown = true; setHandshakeVisible(false);
          try { await storage.setItem(SECURITY_SHOWN_KEY, true); } catch {}
        }} />
      )}

      <PlusModal visible={showPlusModal} reason="memory" onClose={() => setShowPlusModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { height: 48, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  emptyState: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },
  emptyLogo: { marginBottom: 20, alignItems: "center", justifyContent: "center" },
  emptyText: {
    fontSize: 28, fontWeight: "500", fontStyle: "italic", textAlign: "center", letterSpacing: -0.4,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
  },
  tagline: { fontSize: 13, marginTop: 6, marginBottom: 4 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 22, width: "100%", maxWidth: 380 },
  quickChip: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 999, borderTopWidth: 1, borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5, maxWidth: 185,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }, android: { elevation: 1 } }),
  },
  quickChipText: { fontSize: 12.5, fontWeight: "500" },
  privacyLine: { fontSize: 10.5, marginTop: 24, letterSpacing: 0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 20, maxWidth: 672, alignSelf: "center", width: "100%" },
  msgWrap: { width: "100%", marginBottom: 20 },
  userWrap: { alignItems: "flex-end" },
  assistantWrap: { alignItems: "flex-start" },
  userBubble: {
    maxWidth: "78%", backgroundColor: "#4A90E2", paddingVertical: 10, paddingHorizontal: 16,
    borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 4,
    ...Platform.select({ ios: { shadowColor: "#4A90E2", shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 2 } }),
  },
  assistantBlock: { maxWidth: "96%" },
  bodyText: { fontSize: 15.5, lineHeight: 24, letterSpacing: -0.1 },
  inputArea: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8 },
  inputPill: {
    flexDirection: "row", alignItems: "flex-end", minHeight: 50, borderRadius: 28,
    paddingHorizontal: 8, paddingVertical: 6, borderTopWidth: 1, borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5, gap: 4,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 1 } }),
  },
  inputIconBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, minHeight: 38, maxHeight: 120, fontSize: 15, paddingTop: 9, paddingHorizontal: 4 },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
    ...Platform.select({ ios: { shadowColor: "#4A90E2", shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 2 } }),
  },
  toast: { position: "absolute", top: 52, left: 0, right: 0, alignItems: "center", zIndex: 30 },
  toastInner: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 0.5,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, android: { elevation: 4 } }),
  },
  toastText: { fontSize: 12, fontWeight: "500" },
  subActions: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, paddingTop: 8 },
  subActionItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  subActionDot: { paddingHorizontal: 4 },
  dotMini: { width: 2, height: 2, borderRadius: 1 },
  subActionText: { fontSize: 12 },
  suggestionCard: { borderWidth: 0.5, borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 6 },
  suggestionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  suggestionQuestion: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  suggestionRationale: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  suggestionActions: { flexDirection: "row", gap: 8 },
  suggestionBtnGhost: { flex: 1, minHeight: 42, borderRadius: 12, borderWidth: 0.5, alignItems: "center", justifyContent: "center" },
  suggestionBtnGhostText: { fontSize: 13, fontWeight: "500" },
  suggestionBtnPrimary: { flex: 1.5, minHeight: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  suggestionBtnPrimaryText: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
});
