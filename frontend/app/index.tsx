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
import { api, ApiMessage, ChatResponse } from "@/src/api/client";
import { hasOnboarded } from "./onboarding";

// Module-level flag so the handshake plays only once per app launch
let coldLaunchHandshakeShown = false;

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
  const scrollRef = useRef<ScrollView>(null);

  // First mount: route to /onboarding if not done yet
  useEffect(() => {
    (async () => {
      const done = await hasOnboarded();
      if (!done) {
        router.replace("/onboarding");
        return;
      }
      setOnboardingChecked(true);
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

  const handleSend = useCallback(async () => {
    const text = draft.trim();
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
  }, [draft, sending, conversationId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [messages.length]);

  // ── Conditional return AFTER all hooks ─────────────────────
  if (!onboardingChecked) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  const isEmpty = messages.length === 0;
  const hasText = draft.trim().length > 0;

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
            if (messages.length > 0) {
              setHandshakeVisible(true);
            }
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
          <View style={styles.emptyState} testID="chat-empty">
            <Text style={[styles.emptyText, { color: palette.textPrimary }]}>Wat speelt er?</Text>
            <Text style={[styles.tagline, { color: palette.textMuted }]}>Voor wat speelt.</Text>
          </View>
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
                  <View style={[styles.userBubble, { backgroundColor: palette.surfaceElevated }]}>
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

        <View style={[styles.inputArea, { backgroundColor: palette.background }]}>
          <View
            style={[
              styles.inputPill,
              { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
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
            <View style={styles.subActionItem}>
              <Feather name="camera" size={12} color={palette.textMuted} />
              <Text style={[styles.subActionText, { color: palette.textMuted }]}>Foto</Text>
            </View>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 26,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontStyle: "italic",
    textAlign: "center",
  },
  tagline: {
    fontSize: 13,
    marginTop: 12,
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
    minHeight: 48,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 0.5,
    gap: 4,
  },
  inputIconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    fontSize: 15,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  subActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    paddingTop: 6,
  },
  subActionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subActionText: {
    fontSize: 12,
  },
});
