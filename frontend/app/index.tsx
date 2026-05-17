import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { Wordmark } from "@/src/components/Wordmark";
import { Sidebar } from "@/src/components/Sidebar";
import { TestSuggestionPill } from "@/src/components/TestSuggestionPill";
import { SecureHandshake } from "@/src/components/SecureHandshake";
import { PlusHintBanner } from "@/src/components/PlusHintBanner";
import { PlusModal } from "@/src/components/PlusModal";
import { api, ApiMessage, ChatResponse } from "@/src/api/client";
import { hasOnboarded } from "./onboarding";
import { bumpMessageCount, dismissPlusHint, getUsage, UsageSnapshot } from "@/src/utils/usage";

// Module-level flag so the handshake plays only once per app launch
let coldLaunchHandshakeShown = false;

const QUICK_PROMPTS = [
  { id: "vandaag", icon: "sun", label: "Hoe ‘k me vandaag voel" },
  { id: "werk", icon: "briefcase", label: "Werk zit zwaar" },
  { id: "relatie", icon: "heart", label: "Iets in mijn relatie" },
  { id: "piekeren", icon: "wind", label: "Ik blijf piekeren" },
] as const;

export default function ChatScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [handshakeVisible, setHandshakeVisible] = useState(!coldLaunchHandshakeShown);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [showPlusModal, setShowPlusModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // First mount: route to /onboarding if not done yet, then load usage
  useEffect(() => {
    (async () => {
      const done = await hasOnboarded();
      if (!done) {
        router.replace("/onboarding");
        return;
      }
      setOnboardingChecked(true);
      const u = await getUsage();
      setUsage(u);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typewriter cursor blink (only when sending)
  useEffect(() => {
    if (!sending) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, [sending]);

  // Load conversation if selected
  useEffect(() => {
    (async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }
      try {
        const data = await api.getConversation(conversationId);
        setMessages(data.messages);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [conversationId]);

  const sendText = useCallback(
    async (text: string) => {
      if (!text || sending) return;
      setDraft("");
      Keyboard.dismiss();
      setSending(true);

      const optimisticUser: ApiMessage = {
        id: `tmp-${Date.now()}`,
        conversation_id: conversationId ?? "",
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUser]);

      try {
        const res: ChatResponse = await api.chat(text, conversationId ?? undefined);
        setConversationId(res.conversation_id);
        setMessages((prev) => {
          const withoutOpt = prev.filter((m) => m.id !== optimisticUser.id);
          return [...withoutOpt, res.user_message, res.assistant_message];
        });
        // Track usage for soft-paywall — count user-sent messages
        await bumpMessageCount();
        const u = await getUsage();
        setUsage(u);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            conversation_id: conversationId ?? "",
            role: "assistant",
            content: "Er ging iets mis bij het versturen. Probeer 't nog eens.",
            created_at: new Date().toISOString(),
          },
        ]);
        console.warn(e);
      } finally {
        setSending(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
      }
    },
    [conversationId, sending],
  );

  const handleSend = useCallback(() => sendText(draft.trim()), [draft, sendText]);
  const handleQuickPrompt = useCallback((label: string) => sendText(label), [sendText]);

  const handleDismissPlusHint = useCallback(async () => {
    await dismissPlusHint();
    const u = await getUsage();
    setUsage(u);
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [messages.length]);

  // ── Conditional return AFTER all hooks ─────────────────────
  if (!onboardingChecked) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  const isEmpty = messages.length === 0;
  const hasText = draft.trim().length > 0;
  const showPlusHint = !!usage?.shouldShowPlusHint;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={["top", "bottom", "left", "right"]}>
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]} testID="chat-topbar">
        <TouchableOpacity
          testID="chat-hamburger"
          onPress={() => setSidebarOpen(true)}
          style={styles.iconBtn}
        >
          <Feather name="menu" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Wordmark size={15} />
        <TouchableOpacity
          testID="chat-new-pencil"
          onPress={() => {
            setConversationId(null);
            setMessages([]);
            setDraft("");
          }}
          style={styles.iconBtn}
        >
          <Feather name="edit-2" size={20} color={palette.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isEmpty ? (
          <ScrollView
            contentContainerStyle={styles.emptyState}
            showsVerticalScrollIndicator={false}
            testID="chat-empty"
          >
            <View
              style={[
                styles.emptyHaloOuter,
                {
                  borderColor: palette.accent + "22",
                  backgroundColor: palette.accentSoft,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyHaloInner,
                  { borderColor: palette.accent + "55", backgroundColor: palette.background },
                ]}
              >
                <Feather name="compass" size={26} color={palette.accent} />
              </View>
            </View>
            <Text style={[styles.emptyText, { color: palette.textPrimary }]}>Wat speelt er?</Text>
            <Text style={[styles.tagline, { color: palette.textMuted }]}>Voor wat speelt.</Text>

            <View style={styles.quickGrid}>
              {QUICK_PROMPTS.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  testID={`quick-${q.id}`}
                  onPress={() => handleQuickPrompt(q.label)}
                  activeOpacity={0.7}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: palette.surfaceElevated,
                      borderColor: palette.borderSubtle,
                    },
                  ]}
                >
                  <Feather name={q.icon as any} size={14} color={palette.textMuted} />
                  <Text style={[styles.quickChipText, { color: palette.textPrimary }]} numberOfLines={1}>
                    {q.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.privacyLine, { color: palette.textFaint }]}>
              Anoniem · Versleuteld · Niets wordt doorverkocht
            </Text>
          </ScrollView>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            testID="chat-messages"
          >
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.msgWrap,
                  m.role === "user" ? styles.userWrap : styles.assistantWrap,
                ]}
                testID={`message-${m.role}`}
              >
                {m.role === "user" ? (
                  <View
                    style={[
                      styles.userBubble,
                      {
                        backgroundColor: palette.surfaceElevated,
                        borderColor: palette.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[styles.bodyText, { color: palette.textPrimary }]}>{m.content}</Text>
                  </View>
                ) : (
                  <View style={styles.assistantBlock}>
                    <Text style={[styles.bodyText, { color: palette.textPrimary }]}>{m.content}</Text>
                    {m.suggested_test_id ? <TestSuggestionPill testId={m.suggested_test_id} /> : null}
                  </View>
                )}
              </View>
            ))}
            {sending && (
              <View style={[styles.msgWrap, styles.assistantWrap]} testID="chat-typing">
                <View
                  style={[
                    styles.cursor,
                    {
                      backgroundColor: palette.textPrimary,
                      opacity: cursorVisible ? 1 : 0,
                    },
                  ]}
                />
              </View>
            )}
          </ScrollView>
        )}

        {showPlusHint && !isEmpty && (
          <PlusHintBanner
            variant="chat"
            onPress={() => setShowPlusModal(true)}
            onDismiss={handleDismissPlusHint}
          />
        )}

        <View style={[styles.inputArea, { backgroundColor: palette.background }]}>
          <View
            style={[
              styles.inputPill,
              {
                backgroundColor: palette.surfaceElevated,
                borderColor: hasText ? palette.accent + "55" : palette.borderSubtle,
              },
            ]}
          >
            <TouchableOpacity testID="chat-attach" style={styles.inputIconBtn} disabled>
              <Feather name="plus" size={20} color={palette.textMuted} />
            </TouchableOpacity>
            <TextInput
              testID="chat-input"
              style={[styles.input, { color: palette.textPrimary }]}
              placeholder="Bericht Kompas"
              placeholderTextColor={palette.textMuted}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={2000}
              editable={!sending}
            />
            {hasText ? (
              <TouchableOpacity
                testID="chat-send"
                onPress={handleSend}
                disabled={sending}
                activeOpacity={0.8}
                style={[styles.sendBtn, { backgroundColor: palette.accent }]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#0a0a0a" />
                ) : (
                  <Feather name="arrow-up" size={18} color="#0a0a0a" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity testID="chat-mic" style={styles.inputIconBtn} disabled>
                <Feather name="mic" size={18} color={palette.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.subActions}>
            <View style={styles.subActionItem}>
              <Feather name="mic" size={12} color={palette.textMuted} />
              <Text style={[styles.subActionText, { color: palette.textMuted }]}>Spraak</Text>
            </View>
            <View style={styles.subActionDot}>
              <View style={[styles.dotMini, { backgroundColor: palette.textFaint }]} />
            </View>
            <View style={styles.subActionItem}>
              <Feather name="camera" size={12} color={palette.textMuted} />
              <Text style={[styles.subActionText, { color: palette.textMuted }]}>Foto</Text>
            </View>
            <View style={styles.subActionDot}>
              <View style={[styles.dotMini, { backgroundColor: palette.textFaint }]} />
            </View>
            <TouchableOpacity
              testID="chat-quick-zelftest"
              onPress={() => router.push("/zelftesten")}
              style={styles.subActionItem}
            >
              <Feather name="check-square" size={12} color={palette.textMuted} />
              <Text style={[styles.subActionText, { color: palette.textMuted }]}>Zelftest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentConversationId={conversationId}
        onSelectConversation={(id) => setConversationId(id)}
      />

      {handshakeVisible && (
        <SecureHandshake
          onComplete={() => {
            coldLaunchHandshakeShown = true;
            setHandshakeVisible(false);
          }}
        />
      )}

      <PlusModal
        visible={showPlusModal}
        reason="memory"
        onClose={() => setShowPlusModal(false)}
      />
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
  emptyState: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyHaloOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyHaloInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 28,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 13,
    marginTop: 8,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    width: "100%",
    maxWidth: 380,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 0.5,
    maxWidth: 180,
  },
  quickChipText: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  privacyLine: {
    fontSize: 10.5,
    marginTop: 28,
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    maxWidth: 672,
    alignSelf: "center",
    width: "100%",
  },
  msgWrap: {
    width: "100%",
    marginBottom: 18,
  },
  userWrap: {
    alignItems: "flex-end",
  },
  assistantWrap: {
    alignItems: "flex-start",
  },
  userBubble: {
    maxWidth: "85%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 0.5,
  },
  assistantBlock: {
    maxWidth: "96%",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: -0.1,
  },
  cursor: {
    width: 4,
    height: 16,
  },
  inputArea: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  inputPill: {
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: 50,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 0.5,
    gap: 4,
  },
  inputIconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    fontSize: 15,
    paddingTop: 9,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  subActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
  },
  subActionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  subActionDot: {
    paddingHorizontal: 4,
  },
  dotMini: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  subActionText: {
    fontSize: 12,
  },
});
