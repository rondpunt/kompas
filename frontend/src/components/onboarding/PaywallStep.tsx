import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';
import { api } from '@/src/api/client';
import { APP_NAME, APP_PLUS_NAME } from '@/src/config/branding';

interface Props {
  userId: string | null;
  onTrialStarted: (endsAt: string) => void;
  onSkip: () => void;
}

const FEATURES = [
  'Onbeperkte gesprekken',
  'Cross-session geheugen',
  'Community: posten + DM',
  'PDF-export voor therapeut',
];

export function PaywallStep({ userId, onTrialStarted, onSkip }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const trialEndStr = trialEnd.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' });

  const startTrial = async () => {
    setLoading(true);
    try {
      const data = await api.createStripeCheckoutSession({ plan, user_id: userId ?? 'anonymous' });
      if (data.checkoutUrl) {
        await WebBrowser.openBrowserAsync(data.checkoutUrl);
      }
    } catch {
      // graceful fallback
    }
    onTrialStarted(trialEnd.toISOString());
    setLoading(false);
  };

  const price = plan === 'monthly' ? '12,99' : '119,99';

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.plusBadge}>
          <Feather name="zap" size={11} color={OB.inverse} />
          <Text style={s.plusBadgeText}>{APP_PLUS_NAME.toUpperCase()}</Text>
        </View>

        <Text style={s.headline}>14 dagen gratis proberen</Text>
        <Text style={s.subtext}>Geen betaling vandaag. Annuleer wanneer je wil.</Text>

        <View style={s.featuresCard}>
          {FEATURES.map((f) => (
            <View key={f} style={s.featureRow}>
              <View style={s.checkDot}>
                <Feather name="check" size={11} color={OB.inverse} />
              </View>
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={s.planRow}>
          <TouchableOpacity
            testID="paywall-plan-monthly"
            style={[s.planCard, plan === 'monthly' && s.planCardSelected]}
            onPress={() => setPlan('monthly')}
            activeOpacity={0.8}
          >
            <Text style={[s.planLabel, plan === 'monthly' && s.planLabelSel]}>Maandelijks</Text>
            <Text style={[s.planPrice, plan === 'monthly' && s.planPriceSel]}>€12,99</Text>
            <Text style={s.planUnit}>/maand</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="paywall-plan-annual"
            style={[s.planCard, plan === 'annual' && s.planCardSelected]}
            onPress={() => setPlan('annual')}
            activeOpacity={0.8}
          >
            <View style={s.bestBadge}><Text style={s.bestText}>BESPAAR €36</Text></View>
            <Text style={[s.planLabel, plan === 'annual' && s.planLabelSel]}>Jaarlijks</Text>
            <Text style={[s.planPrice, plan === 'annual' && s.planPriceSel]}>€119,99</Text>
            <Text style={s.planUnit}>€10/maand</Text>
          </TouchableOpacity>
        </View>

        <View style={s.timelineRow}>
          <Feather name="calendar" size={13} color={OB.accent} />
          <Text style={s.timelineText}>
            Eerste betaling op <Text style={{ color: OB.textPrimary, fontWeight: '600' }}>{trialEndStr}</Text> — herinnering 1 dag ervoor.
          </Text>
        </View>

        <Text style={s.legal}>{APP_NAME} vervangt geen therapie. Anoniem starten kan ook gratis.</Text>
      </ScrollView>

      <View style={s.ctaWrap}>
        <TouchableOpacity
          testID="paywall-start-trial"
          style={[s.cta, loading && { opacity: 0.7 }]}
          onPress={startTrial}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.ctaText}>{loading ? 'Bezig…' : 'Start gratis trial'}</Text>
          <Feather name="arrow-right" size={16} color={OB.inverse} />
        </TouchableOpacity>
        <TouchableOpacity testID="paywall-skip" style={s.skipBtn} onPress={onSkip}>
          <Text style={s.skipText}>Liever zonder Plus</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  plusBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: OB.accent, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999, marginBottom: 14,
  },
  plusBadgeText: { color: OB.inverse, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.4 },
  headline: {
    fontSize: 26, fontWeight: '500', lineHeight: 32, color: OB.textPrimary,
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }),
    marginBottom: 6, letterSpacing: -0.3,
  },
  subtext: { fontSize: 14, color: OB.textMuted, marginBottom: 18 },
  featuresCard: {
    backgroundColor: OB.surface, borderRadius: 14, padding: 14,
    gap: 10, marginBottom: 16, borderWidth: 0.5, borderColor: OB.border,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: OB.accent, alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 13.5, color: OB.textSecondary, flex: 1, lineHeight: 19 },
  planRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  planCard: {
    flex: 1, backgroundColor: OB.surface, borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: OB.border, position: 'relative',
  },
  planCardSelected: { borderColor: OB.accent, backgroundColor: OB.accentSoft },
  planLabel: { fontSize: 12, color: OB.textMuted, fontWeight: '500', marginBottom: 6 },
  planLabelSel: { color: OB.textPrimary },
  planPrice: { fontSize: 22, fontWeight: '700', color: OB.textSecondary, letterSpacing: -0.5 },
  planPriceSel: { color: OB.textPrimary },
  planUnit: { fontSize: 11.5, color: OB.textMuted, marginTop: 2 },
  bestBadge: {
    position: 'absolute', top: -8, right: 8,
    backgroundColor: OB.accent, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
  },
  bestText: { color: OB.inverse, fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  timelineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: OB.surface, borderRadius: 10,
    borderWidth: 0.5, borderColor: OB.border, marginBottom: 12,
  },
  timelineText: { fontSize: 12.5, color: OB.textMuted, flex: 1, lineHeight: 17 },
  legal: { textAlign: 'center', fontSize: 11, color: OB.textFaint, marginBottom: 6 },
  ctaWrap: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 6, backgroundColor: OB.bg },
  cta: {
    height: 52, borderRadius: 14, backgroundColor: OB.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: OB.inverse },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 13, color: OB.textMuted },
});
