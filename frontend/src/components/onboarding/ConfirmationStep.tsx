import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB } from './ob-theme';
import { APP_NAME } from '@/src/config/branding';

interface Props { trialEndsAt: string | null; onChat: () => void; onTests: () => void; onSettings: () => void; onDone: () => void; }

const ACTIONS = [
  { icon: 'message-circle', label: 'Start een gesprek', key: 'chat', color: '#4A90E2' },
  { icon: 'check-square', label: 'Doe een zelftest', key: 'tests', color: '#7ED957' },
  { icon: 'settings', label: 'Stel je profiel in', key: 'settings', color: '#F39C4D' },
] as const;

export function ConfirmationStep({ trialEndsAt, onChat, onTests, onSettings, onDone }: Props) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const handlers = { chat: onChat, tests: onTests, settings: onSettings };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 140 }),
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const trialStr = trialEndsAt ? new Date(trialEndsAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' }) : null;

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.content, { opacity: fade }]}>
        <View style={s.hero}>
          <Animated.View style={[s.checkCircle, { transform: [{ scale }] }]}>
            <Feather name="check" size={32} color="#fff" />
          </Animated.View>
          <Text style={s.headline}>Je bent er klaar voor</Text>
          <Text style={s.subtext}>
            {trialStr ? `Je Plus-trial loopt tot ${trialStr}.` : `Welkom bij ${APP_NAME}.`}
          </Text>
        </View>

        <View style={s.actions}>
          <Text style={s.actionsLabel}>Waar wil je beginnen?</Text>
          {ACTIONS.map((a) => (
            <TouchableOpacity key={a.key} style={[s.actionRow, { borderColor: a.color + '30', backgroundColor: a.color + '08' }]} onPress={handlers[a.key]} activeOpacity={0.8}>
              <View style={[s.actionIcon, { backgroundColor: a.color + '20' }]}>
                <Feather name={a.icon as any} size={18} color={a.color} />
              </View>
              <Text style={s.actionText}>{a.label}</Text>
              <Feather name="arrow-right" size={16} color={a.color} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.skipBtn} onPress={onDone}>
          <Text style={s.skipText}>Direct naar de app</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  hero: { alignItems: 'center', marginBottom: 32 },
  checkCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: OB.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    ...Platform.select({ ios: { shadowColor: OB.green, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }, android: { elevation: 6 } }),
  },
  headline: {
    fontSize: 26, fontWeight: '700', color: OB.textPrimary, textAlign: 'center', letterSpacing: -0.4, marginBottom: 10,
    fontFamily: Platform.select({ ios: 'Nunito', android: 'sans-serif', default: 'system-ui' }),
  },
  subtext: { fontSize: 14.5, color: OB.textMuted, textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  actions: { gap: 10, flex: 1 },
  actionsLabel: { fontSize: 11.5, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: OB.textMuted, marginBottom: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 0.5 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1, fontSize: 15, fontWeight: '500', color: OB.textPrimary },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 14, color: OB.textMuted, fontWeight: '500' },
});
