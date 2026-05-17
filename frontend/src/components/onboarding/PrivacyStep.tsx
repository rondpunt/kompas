import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB } from './ob-theme';
import { useAuth } from '@/src/auth/AuthContext';

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
      // signIn updates AuthContext state; check if authenticated
    } finally {
      setLoading(false);
    }
    // Navigate regardless (signIn may have succeeded or user closed browser)
    onAccount();
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.headline}>Hoe wil je{`\n`}verdergaan?</Text>
        <Text style={s.sub}>Kompas werkt op beide manieren. Jouw keuze.</Text>

        {/* Anonymous card */}
        <TouchableOpacity style={s.card} onPress={onAnonymous} activeOpacity={0.85}>
          <View style={s.cardHeader}>
            <View style={s.iconBadge}>
              <Feather name="eye-off" size={20} color={OB.textSecondary} />
            </View>
            <Text style={s.cardTitle}>Anoniem blijven</Text>
          </View>
          <View style={s.bullets}>
            {[
              'Gesprekken blijven op dit apparaat',
              'Geen email of account nodig',
              'Maximale privacy',
              'Kan later nog account aanmaken',
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

        {/* Account card */}
        <TouchableOpacity style={[s.card, s.cardAccent]} onPress={handleAccount} activeOpacity={0.85} disabled={loading}>
          <View style={s.cardHeader}>
            <View style={[s.iconBadge, s.iconBadgeAccent]}>
              <Feather name="lock" size={20} color={OB.accent} />
            </View>
            <Text style={[s.cardTitle, s.cardTitleAccent]}>Account aanmaken</Text>
          </View>
          <View style={s.bullets}>
            {[
              'Gesprekken beschikbaar op alle apparaten',
              'Cross-session geheugen (Plus feature)',
              'PDF export naar je therapeut',
              'Altijd anoniem te maken',
            ].map((b) => (
              <View key={b} style={s.bullet}>
                <View style={[s.bulletDot, { backgroundColor: OB.accent }]} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={s.cardCta}>
            <Text style={[s.cardCtaText, { color: OB.accent }]}>
              {loading ? 'Bezig...' : 'Aanmelden met Google'}
            </Text>
            <Feather name="arrow-right" size={14} color={OB.accent} />
          </View>
        </TouchableOpacity>

        <Text style={s.footer}>
          Je gegevens worden opgeslagen op EU-servers. Nooit doorverkocht of gedeeld.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  headline: {
    fontSize: 32, fontWeight: '500', lineHeight: 40,
    color: OB.textPrimary, marginBottom: 12,
  },
  sub: { fontSize: 15, color: OB.textMuted, marginBottom: 32 },
  card: {
    backgroundColor: OB.surface, borderWidth: 1,
    borderColor: OB.border, borderRadius: 20, padding: 22, marginBottom: 16,
  },
  cardAccent: { borderColor: OB.accent + '66' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  iconBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: OB.elevated, alignItems: 'center', justifyContent: 'center',
  },
  iconBadgeAccent: { backgroundColor: OB.accentSoft },
  cardTitle: { fontSize: 18, fontWeight: '600', color: OB.textPrimary },
  cardTitleAccent: { color: OB.accent },
  bullets: { gap: 10, marginBottom: 20 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: OB.textMuted },
  bulletText: { fontSize: 14, color: OB.textSecondary, flex: 1 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardCtaText: { fontSize: 14, fontWeight: '600', color: OB.textSecondary },
  footer: { textAlign: 'center', fontSize: 12, color: OB.textFaint, marginTop: 8, lineHeight: 18 },
});
