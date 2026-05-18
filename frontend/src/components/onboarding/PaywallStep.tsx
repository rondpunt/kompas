import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { OB } from './ob-theme';

const PLANS = [
  {
    id: 'maand',
    label: 'Maandelijks',
    price: '€9,99',
    period: '/maand',
    badge: null,
    accent: OB.blauw,
  },
  {
    id: 'jaar',
    label: 'Jaarlijks',
    price: '€5,99',
    period: '/maand',
    badge: 'BESTE DEAL',
    accent: OB.groen,
  },
];

const FEATURES = [
  { icon: '💬', label: 'Onbeperkt chatten', color: OB.blauw },
  { icon: '📊', label: 'Alle zelftesten', color: OB.groen },
  { icon: '🏘️', label: 'Community toegang', color: OB.geel },
  { icon: '📈', label: 'Persoonlijk dashboard', color: OB.oranje },
  { icon: '🔒', label: '100% privé & veilig', color: OB.koraal },
];

interface Props {
  onSelect: (planId: string) => void;
  onSkip: () => void;
}

export default function PaywallStep({ onSelect, onSkip }: Props) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const [selected, setSelected] = React.useState('jaar');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.crown}>✨</Text>
          <Text style={styles.title}>Junie Plus</Text>
          <Text style={styles.subtitle}>
            Alles wat je nodig hebt voor jouw{'
'}mentale welzijn, op één plek.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '22' }]}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={[styles.check, { color: OB.groen }]}>✓</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plans}>
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  active && { borderColor: plan.accent, backgroundColor: plan.accent + '10' },
                ]}
                onPress={() => setSelected(plan.id)}
                activeOpacity={0.8}
              >
                {plan.badge && (
                  <View style={[styles.badge, { backgroundColor: plan.accent }]}>
                    <Text style={styles.badgeText}>{plan.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planLabel, active && { color: plan.accent }]}>{plan.label}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, active && { color: plan.accent }]}>{plan.price}</Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
                {active && (
                  <View style={[styles.activeDot, { backgroundColor: plan.accent }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: OB.blauw }]}
          onPress={() => onSelect(selected)}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Start gratis proefperiode</Text>
        </TouchableOpacity>

        <Text style={styles.trial}>7 dagen gratis · Daarna {selected === 'jaar' ? '€71,88/jaar' : '€9,99/maand'} · Altijd opzegbaar</Text>

        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Misschien later</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Door te abonneren ga je akkoord met onze{' '}
          <Text style={styles.legalLink}>gebruiksvoorwaarden</Text> en{' '}
          <Text style={styles.legalLink}>privacybeleid</Text>.
        </Text>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.achtergrond },
  scroll: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  crown: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 30, fontFamily: OB.fontBrand, fontWeight: '800', color: OB.tekst, marginBottom: 8 },
  subtitle: { fontSize: 15, color: OB.subtekst, textAlign: 'center', lineHeight: 22, fontFamily: OB.fontUI },
  features: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 2 } }),
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureEmoji: { fontSize: 16 },
  featureLabel: { flex: 1, fontSize: 14, color: OB.tekst, fontFamily: OB.fontUI },
  check: { fontSize: 16, fontWeight: '700' },
  plans: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  planCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8ECF0',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5, fontFamily: OB.fontUI },
  planLabel: { fontSize: 13, color: OB.subtekst, fontFamily: OB.fontUI, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  price: { fontSize: 22, fontWeight: '800', color: OB.tekst, fontFamily: OB.fontBrand },
  period: { fontSize: 12, color: OB.subtekst, marginLeft: 2, marginBottom: 2, fontFamily: OB.fontUI },
  activeDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  cta: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({ ios: { shadowColor: OB.blauw, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 4 } }),
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: OB.fontBrand },
  trial: { textAlign: 'center', fontSize: 12, color: OB.subtekst, marginBottom: 16, fontFamily: OB.fontUI },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 14, color: OB.subtekst, fontFamily: OB.fontUI },
  legal: { fontSize: 11, color: OB.subtekst, textAlign: 'center', marginTop: 12, lineHeight: 16, fontFamily: OB.fontUI },
  legalLink: { color: OB.blauw, textDecorationLine: 'underline' },
});
