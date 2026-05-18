import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';

// Junie brand colors
const BLAUW   = '#4A90E2';
const GROEN   = '#7ED957';
const GEL     = '#F5C84B';

const STEPS = [
  { icon: '🔒', label: 'Verbinding beveiligen', color: BLAUW },
  { icon: '🛡️', label: 'Privacy controleren',   color: GROEN },
  { icon: '✨', label: 'Junie klaaarzetten',     color: GEL   },
];

interface Props {
  onComplete?: () => void;
}

export default function SecureHandshake({ onComplete }: Props) {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const stepOpacity = STEPS.map(() => useRef(new Animated.Value(0)).current);
  const stepCheck   = STEPS.map(() => useRef(new Animated.Value(0)).current);
  const logoScale   = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const completeFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true }),
    ]).start();

    // Typing dots loop
    const loopDots = () => {
      const anims = dots.map((d, i) =>
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
      Animated.loop(Animated.stagger(150, anims)).start();
    };
    loopDots();

    // Steps: reveal one by one
    STEPS.forEach((_, i) => {
      Animated.sequence([
        Animated.delay(600 + i * 900),
        Animated.timing(stepOpacity[i], { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.delay(400),
        Animated.spring(stepCheck[i], { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
      ]).start();
    });

    // Complete
    const totalDelay = 600 + STEPS.length * 900 + 400;
    const timer = setTimeout(() => {
      Animated.timing(completeFade, { toValue: 1, duration: 400, useNativeDriver: true }).start(() => {
        onComplete && onComplete();
      });
    }, totalDelay);

    return () => clearTimeout(timer);
  }, []);

  const DOT_COLORS = [BLAUW, GROEN, GEL];

  return (
    <View style={styles.root}>
      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logoText}>Junie</Text>
        {/* Typing indicator */}
        <View style={styles.dotsRow}>
          {dots.map((d, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: DOT_COLORS[i] },
                { opacity: d, transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Steps */}
      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <Animated.View key={i} style={[styles.stepRow, { opacity: stepOpacity[i] }]}>
            <View style={[styles.stepIcon, { backgroundColor: step.color + '22' }]}>
              <Text style={styles.stepEmoji}>{step.icon}</Text>
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Animated.Text
              style={[
                styles.stepCheck,
                { color: GROEN, opacity: stepCheck[i], transform: [{ scale: stepCheck[i] }] },
              ]}
            >
              ✓
            </Animated.Text>
          </Animated.View>
        ))}
      </View>

      {/* Complete overlay */}
      <Animated.View style={[styles.completeOverlay, { opacity: completeFade }]}>
        <Text style={styles.completeEmoji}>🌱</Text>
        <Text style={styles.completeText}>Alles klaar!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoWrap: { alignItems: 'center', marginBottom: 48 },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A1F36',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 16,
  },
  dotsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  steps: { width: '100%', gap: 12 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepEmoji: { fontSize: 18 },
  stepLabel: { flex: 1, fontSize: 15, color: '#1A1F36', fontFamily: 'System', fontWeight: '500' },
  stepCheck: { fontSize: 20, fontWeight: '700' },
  completeOverlay: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  completeEmoji: { fontSize: 36, marginBottom: 8 },
  completeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1F36',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
