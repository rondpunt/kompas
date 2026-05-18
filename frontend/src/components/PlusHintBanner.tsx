import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BRAND, RADII } from "@/src/theme/tokens";

type BannerVariant = "chat" | "test" | "memory";

const COPY: Record<BannerVariant, { icon: string; title: string; sub: string }> = {
  chat: { icon: "zap", title: "Je nadert je gratis limiet", sub: "Upgrade voor onbeperkte gesprekken" },
  test: { icon: "check-square", title: "Dit is een Plus zelftest", sub: "Upgrade voor alle 24 testen" },
  memory: { icon: "cpu", title: "Cross-session geheugen", sub: "Upgrade zodat Kompas je onthoudt" },
};

interface Props { variant: BannerVariant; onPress: () => void; onDismiss: () => void; }

export function PlusHintBanner({ variant, onPress, onDismiss }: Props) {
  const slideY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const copy = COPY[variant];
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 160 }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY: slideY }] }]}>
      <TouchableOpacity style={styles.inner} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.iconWrap}><Feather name={copy.icon as any} size={16} color="#fff" /></View>
        <View style={styles.text}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.sub}>{copy.sub}</Text>
        </View>
        <View style={styles.cta}><Text style={styles.ctaText}>Plus</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dismiss} onPress={onDismiss}>
        <Feather name="x" size={14} color={BRAND.blue} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12, marginBottom: 6, flexDirection: "row",
    backgroundColor: BRAND.blueAlpha08, borderRadius: RADII.md,
    borderWidth: 0.5, borderColor: BRAND.blueAlpha25, overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: BRAND.blue, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  inner: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: BRAND.blue, alignItems: "center", justifyContent: "center" },
  text: { flex: 1 },
  title: { fontSize: 13, fontWeight: "600", color: "#111111" },
  sub: { fontSize: 11.5, color: "#6B7280", marginTop: 1 },
  cta: { backgroundColor: BRAND.blue, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  ctaText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  dismiss: { paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: BRAND.blueAlpha15 },
});
