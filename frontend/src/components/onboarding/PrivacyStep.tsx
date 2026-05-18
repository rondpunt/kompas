import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';
import { useAuth } from '@/src/auth/AuthContext';
import { APP_NAME } from '@/src/config/branding';

interface Props {
  onAnonymous: () => void;
  onAccount: () => void;
}

export function PrivacyStep({ onAnonymous, onAccount }: Props) {
  const { signIn } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleAccount = async () => {
    setLoading(true);
    try {
      await signIn();
    } finally {
      setLoading(false);
    }
    onAccount();
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.headline}>Hoe wil je verder?</Text>
        <Text style={s.sub}>{APP_NAME} werkt op beide manieren. Kies wat past.</Text>

        <TouchableOpacity style={s.card} onPress={onAnonymous} activeOpacity={0.8}>
          <View style={s.head}>
            <View style={s.iconBadge}>
              <Feather name="eye-off" size={18} color={OB.textPrimary} />
            </View>
            <Text style={s.cardTitle}>Anoniem blijven</Text>
          </View>
          <View style={s.bullets}>
            {[
              'Gesprekken op dit toestel',
              'Geen email of account',
              'Maximale privacy',
            ].map((b) => (
              <View key={b} style={s.bullet}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={s.cardCta}>
            <Text style={s.cardCtaText}>Anoniem verdergaan</Text>
            <Feather name="arrow-right" size={14} color={OB.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[s.card, s.cardAccent]} onPress={handleAccount} activeOpacity={0.8} disabled={loading}>
          <View style={s.head}>
            <View style={[s.iconBadge, s.iconBadgeAccent]}>
              <Feather name="user" size={18} color={OB.accent} />
            </View>
            <Text style={[s.cardTitle, { color: OB.accent }]}>Account aanmaken</Text>
          </View>
          <View style={s.bullets}>
            {[
              'Sync over al je toestellen',
              'Geheugen tussen gesprekken (Plus)',
              'PDF-export voor therapeut',
            ].map((b) => (
              <View key={b} style={s.bullet}>
                <View style={[s.bulletDot, { backgroundColor: OB.accent }]} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={s.cardCta}>
            <Text style={[s.cardCtaText, { color: OB.accent }]}>
              {loading ? 'Bezig…' : 'Aanmelden met Google'}
            </Text>
            <Feather name="arrow-right" size={14} color={OB.accent} />
          </View>
        </TouchableOpacity>

        <Text style={s.footer}>
          EU-servers. Nooit doorverkocht of gedeeld.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30 },
  headline: {
    fontSize: 26, fontWeight: '500', lineHeight: 32,
    color: OB.textPrimary, marginBottom: 8,
    fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }),
    fontStyle: 'italic', letterSpacing: -0.3,
  },
  sub: { fontSize: 14, color: OB.textMuted, marginBottom: 22 },
  card: {
    backgroundColor: OB.surface, borderWidth: 0.5,
    borderColor: OB.border, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  cardAccent: { borderColor: OB.accent + '55' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: OB.elevated, alignItems: 'center', justifyContent: 'center',
  },
  iconBadgeAccent: { backgroundColor: OB.accentSoft },
  cardTitle: { fontSize: 16, fontWeight: '600', color: OB.textPrimary },
  bullets: { gap: 8, marginBottom: 14 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bulletDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: OB.textMuted },
  bulletText: { fontSize: 13.5, color: OB.textSecondary, flex: 1 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardCtaText: { fontSize: 13.5, fontWeight: '600', color: OB.textSecondary },
  footer: { textAlign: 'center', fontSize: 11.5, color: OB.textFaint, marginTop: 8, lineHeight: 17 },
});
