import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import { LAYERS } from '@/src/theme/tokens';

const BLAUW = '#4A90E2';

interface Msg {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

const MOCK: Msg[] = [
  { id: '1', text: 'Hoi! Hoe gaat het met je vandaag?', fromMe: false, time: '14:00' },
  { id: '2', text: 'Gaat wel, een beetje moe. Jij?', fromMe: true, time: '14:01' },
  { id: '3', text: 'Ook oké. Ik deed net die ademhalingsoefening die iemand deelde.', fromMe: false, time: '14:02' },
];

export default function PeerChatScreen() {
  const { peer } = useLocalSearchParams<{ peer: string }>();
  const { theme } = useTheme();
  const c = theme === 'dark' ? LAYERS.DARK : LAYERS.LIGHT;
  const [msgs, setMsgs] = useState<Msg[]>(MOCK);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const send = () => {
    if (!input.trim()) return;
    const msg: Msg = { id: Date.now().toString(), text: input.trim(), fromMe: true, time: new Date().toLocaleTimeString('nl', { hour: '2-digit', minute: '2-digit' }) };
    setMsgs(prev => [...prev, msg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]} edges={['bottom']}>
      <Stack.Screen options={{ title: peer || 'Gesprek', headerShown: true }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubbleWrap, item.fromMe && styles.bubbleWrapMe]}>
              {item.fromMe ? (
                <View style={[styles.bubble, styles.bubbleMe]}>
                  <Text style={styles.bubbleMeText}>{item.text}</Text>
                  <Text style={styles.bubbleTime}>{item.time}</Text>
                </View>
              ) : (
                <View>
                  <Text style={[styles.bubbleOtherText, { color: c.text }]}>{item.text}</Text>
                  <Text style={[styles.bubbleTime, { color: c.subtle }]}>{item.time}</Text>
                </View>
              )}
            </View>
          )}
        />
        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: c.card, borderTopColor: c.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: c.bg, color: c.text }]}
            placeholder="Schrijf iets..."
            placeholderTextColor={c.subtle}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? BLAUW : c.border }]}
            onPress={send}
            activeOpacity={0.85}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 8 },
  bubbleWrap: { maxWidth: '75%' },
  bubbleWrapMe: { alignSelf: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: BLAUW },
  bubbleMeText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  bubbleOtherText: { fontSize: 15, lineHeight: 22 },
  bubbleTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
