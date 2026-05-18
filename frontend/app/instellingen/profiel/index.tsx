import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, Alert, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { LAYERS, PALETTE } from "@/src/theme/tokens";

// Junie brand colors
const BLAUW  = '#4A90E2';
const GROEN  = '#7ED957';
const GEL    = '#F5C84B';
const ORANJE = '#F39C4D';
const KORAAL = '#E85A5A';

const SECTIONS = [
  { id: 'naam',       label: 'Naam',           icon: '👤', color: BLAUW },
  { id: 'email',      label: 'E-mail',          icon: '📧', color: GROEN },
  { id: 'wachtwoord', label: 'Wachtwoord',      icon: '🔒', color: GEL   },
  { id: 'taal',       label: 'Taal',            icon: '🌐', color: ORANJE },
  { id: 'notificaties',label: 'Notificaties',   icon: '🔔', color: BLAUW },
  { id: 'privacy',    label: 'Privacy',         icon: '🛡️', color: GROEN },
  { id: 'abonnement', label: 'Abonnement',      icon: '✨', color: GEL   },
  { id: 'data',       label: 'Mijn gegevens',   icon: '📊', color: ORANJE },
];

export default function ProfielScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? LAYERS.DARK : LAYERS.LIGHT;
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ title: 'Profiel', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <View style={[styles.avatarCircle, { backgroundColor: BLAUW + '22' }]}>
            <Text style={styles.avatarEmoji}>🌱</Text>
          </View>
          <Text style={[styles.avatarName, { color: colors.text }]}>Mijn profiel</Text>
          <Text style={[styles.avatarSub, { color: colors.subtle }]}>Junie Plus</Text>
        </View>

        {/* Sections */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {SECTIONS.map((s, i) => (
            <React.Fragment key={s.id}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push('/instellingen/profiel/' + s.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.rowIcon, { backgroundColor: s.color + '18' }]}>
                  <Text style={styles.rowEmoji}>{s.icon}</Text>
                </View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>{s.label}</Text>
                <Text style={[styles.chevron, { color: colors.subtle }]}>›</Text>
              </TouchableOpacity>
              {i < SECTIONS.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  avatar: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarEmoji: { fontSize: 36 },
  avatarName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  avatarSub: { fontSize: 13, fontWeight: '500', color: '#4A90E2' },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 2 } }),
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, minHeight: 56 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowEmoji: { fontSize: 16 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  chevron: { fontSize: 20, fontWeight: '300' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 66 },
});
