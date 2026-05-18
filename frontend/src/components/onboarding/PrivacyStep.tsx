import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB } from './ob-theme';
import { APP_NAME } from '@/src/config/branding';

interface Props { onAnonymous: () => void; onAccount: () => void; }

export function PrivacyStep({ onAnonymous, onAccount }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.content, { opacity: fade }]}>
        <View style={s.header}>
          <View style={s.shieldWrap}><Feather name="shield" size={28} color={OB.green} /></View>
          <Text style={s.headline}>Hoe wil je starten?</Text>
          <Text style={s.subtext}>{APP_NAME} werkt volledig anoniem. Een account is optioneel.</Text>
        </View>

        <View style={s.cards}>
          <TouchableOpacity style={[s.card, s.cardGreen]} onPress={onAnonymous} activeOpacity={0.85} testID="privacy-anonymous">
            <View style={s.cardHeader}>
              <View style={[s.iconCircle, { backgroundColor: OB.green + '20' }]}>
                <Feather name="user-x" size={18} color={OB.green} />
              </View>
              <View>
                <Text style={s.cardTitle}>Anoniem doorgaan</Text>
                <Text style={[s.badge, { color: OB.green }]}>Aanbevolen</Text>
              </View>
            </View>
            {['Geen account nodig', 'Niets gelinkt aan je identiteit', 'Gesprekken op dit toestel'].map(b => (
              <View key={b} style={s.bullet}>
                <Feather name="check" size={13} color={OB.green} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}
            <View style={s.cardCta}>
              <Text style={[s.cardCtaText, { color: OB.green }]}>Start anoniem</Text>
              <Feather name="arrow-right" size={15} color={OB.green} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[s.card, s.cardDefault]} onPress={onAccount} activeOpacity={0.85} testID="privacy-account">
            <View style={s.cardHeader}>
              <View style={[s.iconCircle, { backgroundColor: OB.accentSoft }]}>
                <Feather name="user" size={18} color={OB.accent} />
              </View>
              <Text style={s.cardTitle}>Account aanmaken</Text>
            </View>
            {['Sync tussen toestellen', 'Gesprekken bewaard in de cloud', 'Vereist voor Plus-tier'].map(b => (
              <View key={b} style={s.bullet}>
                <Feather name="check" size={13} color={OB.accent} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}
            <View style={s.cardCta}>
              <Text style={[s.cardCtaText, { color: OB.accent }]}>Verder met account</Text>
              <Feather name="arrow-right" size={15} color={OB.accent} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={s.legal}>EU-servers · Geen doorverkoop · AVG-conform</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  shieldWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: OB.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  headline: {
    fontSize: 24, fontWeight: '700', color: OB.textPrimary, textAlign: 'center', letterSpacing: -0.4, marginBottom: 8,
    fontFamily: Platform.select({ ios: 'Nunito', android: 'sans-serif', default: 'system-ui' }),
  },
  subtext: { fontSize: 14, color: OB.textMuted, textAlign: 'center', lineHeight: 20 },
  cards: { gap: 12, flex: 1 },
  card: { borderRadius: 16, padding: 18, gap: 10, borderWidth: 0.5 },
  cardGreen: { backgroundColor: OB.successBg, borderColor: OB.green + '40',
    ...Platform.select({ ios: { shadowColor: OB.green, shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }, android: { elevation: 2 } }) },
  cardDefault: { backgroundColor: OB.surface, borderColor: OB.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: OB.textPrimary },
  badge: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 1 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bulletText: { fontSize: 13.5, color: OB.textSecondary, flex: 1 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  cardCtaText: { fontSize: 14, fontWeight: '600' },
  legal: { textAlign: 'center', fontSize: 10.5, color: OB.textFaint, marginTop: 14 },
});
