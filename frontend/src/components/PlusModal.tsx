import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BRAND, RADII, LAYERS, BORDER } from "@/src/theme/tokens";
import { APP_NAME, APP_PLUS_NAME } from "@/src/config/branding";

type ModalReason = "chat" | "memory" | "test" | "community" | "generic";

const REASON_COPY: Record<ModalReason, { icon: string; headline: string; sub: string }> = {
  chat: { icon: "message-circle", headline: "Onbeperkte gesprekken", sub: "Je hebt je gratis limiet bereikt voor deze periode." },
  memory: { icon: "cpu", headline: "Cross-session geheugen", sub: "Kompas onthoudt je context over gesprekken heen." },
  test: { icon: "check-square", headline: "Alle 24 zelftesten", sub: "Gevalideerde screeners voor angst, ADHD, stemming en meer." },
  community: { icon: "users", headline: "Anonieme gemeenschap", sub: "Post en reageer anoniem in de Kompas gemeenschap." },
  generic: { icon: "zap", headline: "Kompas Plus", sub: "Het volledige Kompas-pakket voor wie écht vooruit wil." },
};

const FEATURES = [
  { icon: "message-circle", label: "Onbeperkte gesprekken", color: BRAND.blue },
  { icon: "cpu", label: "Cross-session geheugen", color: BRAND.green },
  { icon: "check-square", label: "Alle 24 zelftesten", color: BRAND.yellow },
  { icon: "users", label: "Anonieme community", color: BRAND.coral },
  { icon: "file-text", label: "PDF-export voor therapeut", color: BRAND.orange },
];

interface Props { visible: boolean; reason: ModalReason; onClose: () => void; }

export function PlusModal({ visible, reason, onClose }: Props) {
  const slideY = useRef(new Animated.Value(400)).current;
  const overlay = useRef(new Animated.Value(0)).current;
  const copy = REASON_COPY[reason];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(overlay, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: 400, duration: 220, useNativeDriver: true }),
        Animated.timing(overlay, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlay }]}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Feather name={copy.icon as any} size={22} color={BRAND.blue} />
            </View>
            <View style={styles.headerText}>
              <View style={styles.plusBadge}>
                <Feather name="zap" size={10} color="#fff" />
                <Text style={styles.plusBadgeText}>{APP_PLUS_NAME.toUpperCase()}</Text>
              </View>
              <Text style={styles.headline}>{copy.headline}</Text>
              <Text style={styles.subtext}>{copy.sub}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Features */}
          <ScrollView style={styles.features} showsVerticalScrollIndicator={false}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
                  <Feather name={f.icon as any} size={16} color={f.color} />
                </View>
                <Text style={styles.featureText}>{f.label}</Text>
                <Feather name="check" size={14} color={BRAND.green} />
              </View>
            ))}
          </ScrollView>

          {/* Prijs + CTA */}
          <View style={styles.footer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>€10</Text>
              <View>
                <Text style={styles.pricePeriod}>/maand</Text>
                <Text style={styles.priceSub}>€119,99/jaar · 14 dagen gratis</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
              <Text style={styles.ctaText}>Start gratis trial</Text>
              <Feather name="arrow-right" size={17} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.legal}>{APP_NAME} vervangt geen professionele zorg.</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: LAYERS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 20, maxHeight: "92%",
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: -8 } }, android: { elevation: 20 } }),
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: BORDER.medium, alignSelf: "center", marginTop: 10, marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: BRAND.blueAlpha08, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, gap: 4 },
  plusBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: BRAND.blue, alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  plusBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
  headline: { fontSize: 19, fontWeight: "700", color: "#111111", letterSpacing: -0.3 },
  subtext: { fontSize: 13.5, color: "#6B7280", lineHeight: 18 },
  closeBtn: { padding: 4 },
  features: { paddingHorizontal: 20, maxHeight: 220 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: BORDER.subtle },
  featureIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1, fontSize: 14, color: "#374151" },
  footer: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  priceAmount: { fontSize: 36, fontWeight: "800", color: "#111111", letterSpacing: -1 },
  pricePeriod: { fontSize: 16, color: "#111111", fontWeight: "500" },
  priceSub: { fontSize: 12, color: "#6B7280" },
  cta: {
    height: 52, borderRadius: 14, backgroundColor: BRAND.blue,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    ...Platform.select({ ios: { shadowColor: BRAND.blue, shadowOpacity: 0.40, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } }, android: { elevation: 5 } }),
  },
  ctaText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  legal: { textAlign: "center", fontSize: 10.5, color: "#9CA3AF" },
});
