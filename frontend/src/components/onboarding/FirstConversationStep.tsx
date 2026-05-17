import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OB } from './ob-theme';
import { api } from '@/src/api/client';

interface Props {
  intentions: string[];
  mood: string | null;
  onComplete: (conversationId: string | null) => void;
  onSkip: () => void;
}

function buildOpener(intentions: string[], mood: string | null): string {
  let text = 'Hoi. Ik ben hier om te luisteren naar wat er bij je leeft.\n\n';
  if (mood && !mood.includes('liever niet')) {
    if (mood.includes('zwaar') || mood.includes('uitgeput')) {
      text += 'Het klinkt alsof de laatste weken zwaar zijn geweest.\n\n';
    } else if (mood.includes('onrustig') || mood.includes('gespannen')) {
      text += 'Onrust en spanning — dat neemt energie.\n\n';
    } else if (mood.includes('wisselend')) {
      text += 'Wisselende dagen — goede en moeilijke door elkaar.\n\n';
    }
  }
  text += 'Geen agenda, geen oordeel. Gewoon ruimte om te praten.\n\nWaar wil je beginnen?';
  return text;
}

type Msg = { role: 'user' | 'assistant'; content: string };

export function FirstConversationStep({ intentions, mood, onComplete, onSkip }: Props) {
  const opener = buildOpener(intentions, mood);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: opener }]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [aiResponseCount, setAiResponseCount] = useState(0);
  const [showCta, setShowCta] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const suggestBtnFade = useRef(new Animated.Value(0)).current;

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setSending(true);
    try {
      const res = await api.chat(text, conversationId ?? undefined);
      if (!conversationId) setConversationId(res.conversation_id);
      setMessages((m) => [...m, { role: 'assistant', content: res.assistant_message.content }]);
      const newCount = aiResponseCount + 1;
      setAiResponseCount(newCount);
      if (newCount >= 3 && !showCta) {
        setShowCta(true);
        Animated.timing(suggestBtnFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Even geen verbinding. Probeer het opnieuw.' }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [draft, sending, conversationId, aiResponseCount, showCta]);

  const SUGGESTIONS = [
    'Ik weet niet goed waar te beginnen',
    'Ik voel me gespannen en weet niet waarom',
    'Vertel me hoe dit werkt',
  ];

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View style={s.aiAvatar}>
          <Text style={s.avatarLetter}>K</Text>
        </View>
        <View>
          <Text style={s.headerTitle}>Kompas</Text>
          <Text style={s.headerSub}>Luistert, vraagt door</Text>
        </View>
        <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
          <Text style={s.skipText}>Overslaan</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={s.messagesList}
          contentContainerStyle={s.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          keyboardDismissMode="on-drag"
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleAI]}
            >
              <Text style={[s.bubbleText, msg.role === 'user' ? s.bubbleTextUser : s.bubbleTextAI]}>
                {msg.content}
              </Text>
            </View>
          ))}
          {sending && (
            <View style={s.typingWrap}>
              <ActivityIndicator size="small" color={OB.textMuted} />
            </View>
          )}
        </ScrollView>

        {/* Suggestion chips — only at start */}
        {messages.length === 1 && !sending && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.suggestions}
            contentContainerStyle={s.suggestionsContent}
          >
            {SUGGESTIONS.map((s2) => (
              <TouchableOpacity
                key={s2}
                style={s.suggestionChip}
                onPress={() => { setDraft(s2); }}
              >
                <Text style={s.suggestionText}>{s2}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* CTA after 3+ responses */}
        {showCta && (
          <Animated.View style={[s.ctaBar, { opacity: suggestBtnFade }]}>
            <TouchableOpacity style={s.ctaSecondary} onPress={() => {}}>
              <Text style={s.ctaSecText}>Gesprek bewaren</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ctaPrimary} onPress={() => onComplete(conversationId)}>
              <Text style={s.ctaPriText}>Bekijk wat Kompas biedt →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Schrijf hier..."
            placeholderTextColor={OB.textFaint}
            multiline
            maxLength={2000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[s.sendBtn, (!draft.trim() || sending) && s.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim() || sending}
          >
            <Text style={s.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: OB.border,
  },
  aiAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: OB.accentSoft, borderWidth: 1,
    borderColor: OB.accent + '44', alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 16, fontWeight: '700', color: OB.accent },
  headerTitle: { fontSize: 15, fontWeight: '600', color: OB.textPrimary },
  headerSub: { fontSize: 12, color: OB.textMuted },
  skipBtn: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 6 },
  skipText: { fontSize: 13, color: OB.textMuted },
  messagesList: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  bubble: { maxWidth: '82%', marginBottom: 12, borderRadius: 18, padding: 14 },
  bubbleAI: { backgroundColor: OB.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: OB.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextAI: { color: OB.textPrimary },
  bubbleTextUser: { color: OB.white },
  typingWrap: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16 },
  suggestions: { maxHeight: 44 },
  suggestionsContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  suggestionChip: {
    backgroundColor: OB.surface, borderWidth: 1, borderColor: OB.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  suggestionText: { fontSize: 13, color: OB.textSecondary },
  ctaBar: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16,
    paddingVertical: 10, backgroundColor: OB.bg,
    borderTopWidth: 1, borderTopColor: OB.border,
  },
  ctaSecondary: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1,
    borderColor: OB.border, alignItems: 'center', justifyContent: 'center',
  },
  ctaSecText: { fontSize: 13, color: OB.textSecondary },
  ctaPrimary: {
    flex: 2, height: 44, borderRadius: 12,
    backgroundColor: OB.accent, alignItems: 'center', justifyContent: 'center',
  },
  ctaPriText: { fontSize: 13, fontWeight: '600', color: OB.white },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: OB.border,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: OB.surface,
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    color: OB.textPrimary, fontSize: 15, borderWidth: 1, borderColor: OB.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: OB.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18, color: OB.white, fontWeight: '700' },
});
