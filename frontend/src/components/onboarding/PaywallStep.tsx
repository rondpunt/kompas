import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';
import { api } from '@/src/api/client';

interface Props {
  userId: string | null;
  onTrialStarted: (endsAt: string) => void;
  onSkip: () => void;
}

const FEATURES = [
  'Onbeperkte gesprekken met AI',
  '24 gevalideerde tests (PHQ-9, GAD-7, ASRS, ...)',
  'Cross-session geheugen (onthoudt eerdere gesprekken)',
  'PDF-export voor je therapeut',
  'Voice mode beschikbaar',
];

export function PaywallStep({ userId, onTrialStarted, onSkip }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const trialEndStr = trialEnd.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' });
  const reminderStr = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' });

  const startTrial = async () => {
    setLoading(true);
    try {
      const data = await api.createStripeCheckoutSession({ plan, user_id: userId ?? 'anonymous' });
      if (data.checkoutUrl) {
        await WebBrowser.openBrowserAsync(data.checkoutUrl);
        onTrialStarted(trialEnd.toISOString());
        return;
      }
    } catch {
      // Stripe not configured — graceful fallback: trial started locally
    }
    // Fallback: local trial
    onTrialStarted(trialEnd.toISOString());
    setLoading(false);
  };

  const price = plan === 'monthly' ? '12,99' : '119,99';
  const priceNote = plan === 'annual' ? '€10/maand — bespaar €36' : null;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.headline}>Probeer Kompas Plus{`\n`}14 dagen gratis</Text>
        <Text style={s.subtext}>Geen betaling vandaag. Annuleer op elk moment.</Text>

        {/* Features */}
        <View style={s.featuresCard}>
          {FEATURES.map((f) => (
            <View key={f} style={s.featureRow}>
              <Feather name="check" size={16} color={OB.success} />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={s.timeline}>
          <View style={s.timelineNode}>
            <View style={[s.nodeDot, s.nodeDotActive]} />
            <Text style={s.nodeLabel}>Vandaag</Text>
            <Text style={s.nodeValue}>Gratis</Text>
          </View>
          <View style={s.timelineLine} />
          <View style={s.timelineNode}>
            <View style={s.nodeDot} />
            <Text style={s.nodeLabel}>{reminderStr}</Text>
            <Text style={s.nodeValue}>Herinnering</Text>
          </View>
          <View style={s.timelineLine} />
          <View style={s.timelineNode}>
            <View style={s.nodeDot} />
            <Text style={s.nodeLabel}>{trialEndStr}</Text>
            <Text style={s.nodeValue}>€{price}</Text>
          </View>
        </View>

        {/* Plan toggle */}
        <View style={s.planToggle}>
          <TouchableOpacity
            testID="paywall-plan-monthly"
            style={[s.planCard, plan === 'monthly' && s.planCardSelected]}
            onPress={() => setPlan('monthly')}
          >
            <Text style={[s.planPrice, plan === 'monthly' && s.planPriceSelected]}>€12,99</Text>
            <Text style={s.planInterval}>per maand</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="paywall-plan-annual"
            style={[s.planCard, plan === 'annual' && s.planCardSelected]}
            onPress={() => setPlan('annual')}
          >
            <View style={s.bestValueBadge}><Text style={s.bestValueText}>Beste deal</Text></View>
            <Text style={[s.planPrice, plan === 'annual' && s.planPriceSelected]}>€119,99</Text>
            <Text style={s.planInterval}>per jaar</Text>
            <Text style={s.planSavings}>€10/mnd • bespaar €36</Text>
          </TouchableOpacity>
        </View>

        {/* Social proof */}
        <View style={s.socialProof}>
          <Text style={s.testimonial}>
            “Kompas helpt me om mijn gedachten te ordenen tussen therapie-sessies door.”
          </Text>
          <Text style={s.testimonialName}>— Sarah, 34, Gent</Text>
          <Text style={s.rating}>★★★★★ 4.8 gemiddeld (127 beoordelingen)</Text>
        </View>

        <Text style={s.legal}>Gebruiksvoorwaarden • Privacybeleid • Annulatievoorwaarden</Text>
      </ScrollView>

      <View style={s.ctaWrap}>
        <TouchableOpacity
          testID="paywall-start-trial"
          style={[s.ctaBtn, loading && { opacity: 0.7 }]}
          onPress={startTrial}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.ctaText}>{loading ? 'Bezig...' : 'Start gratis trial →'}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="paywall-skip" style={s.skipBtn} onPress={onSkip}>
          <Text style={s.skipText}>Liever anoniem verder zonder Plus-functies</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 },
  headline: {
    fontSize: 28, fontWeight: '500', lineHeight: 36, color: OB.textPrimary,
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }),
    marginBottom: 10,
  },
  subtext: { fontSize: 15, color: OB.success, marginBottom: 28, fontWeight: '500' },
  featuresCard: {
    backgroundColor: OB.surface, borderRadius: 16, padding: 20,
    gap: 12, marginBottom: 28, borderWidth: 1, borderColor: OB.border,
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featureText: { fontSize: 14, color: OB.textSecondary, flex: 1, lineHeight: 20 },
  timeline: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: OB.surface, borderRadius: 16, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: OB.border,
  },
  timelineNode: { flex: 1, alignItems: 'center', gap: 6 },
  nodeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: OB.border },
  nodeDotActive: { backgroundColor: OB.accent },
  nodeLabel: { fontSize: 12, color: OB.textMuted, textAlign: 'center' },
  nodeValue: { fontSize: 13, fontWeight: '600', color: OB.textPrimary, textAlign: 'center' },
  timelineLine: { flex: 1, height: 1, backgroundColor: OB.border, marginTop: -12 },
  planToggle: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  planCard: {
    flex: 1, backgroundColor: OB.surface, borderRadius: 16,
    padding: 18, borderWidth: 1.5, borderColor: OB.border, alignItems: 'center',
  },
  planCardSelected: { borderColor: OB.accent, backgroundColor: OB.accentSoft },
  bestValueBadge: {
    backgroundColor: OB.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  bestValueText: { fontSize: 11, fontWeight: '700', color: OB.white },
  planPrice: { fontSize: 22, fontWeight: '700', color: OB.textSecondary },
  planPriceSelected: { color: OB.textPrimary },
  planInterval: { fontSize: 12, color: OB.textMuted, marginTop: 4 },
  planSavings: { fontSize: 11, color: OB.success, marginTop: 4 },
  socialProof: {
    backgroundColor: OB.surface, borderRadius: 16, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: OB.border,
  },
  testimonial: { fontSize: 14, color: OB.textSecondary, lineHeight: 21, fontStyle: 'italic', marginBottom: 8 },
  testimonialName: { fontSize: 13, color: OB.textMuted, marginBottom: 6 },
  rating: { fontSize: 13, color: OB.textMuted },
  legal: { textAlign: 'center', fontSize: 11, color: OB.textFaint, marginBottom: 8 },
  ctaWrap: { paddingHorizontal: 24, paddingBottom: 28, paddingTop: 8, backgroundColor: OB.bg },
  ctaBtn: {
    height: 56, borderRadius: 16, backgroundColor: OB.accent,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: OB.white },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 13, color: OB.textMuted },
});
