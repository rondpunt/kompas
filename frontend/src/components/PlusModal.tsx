import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

export type PlusReason = "pdf" | "memory" | "community" | "voice" | "generic";

interface Props {
  visible: boolean;
  reason?: PlusReason;
  onClose: () => void;
  onNotify?: () => void;
  testID?: string;
}

interface Copy {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
}

const COPY: Record<PlusReason, Copy> = {
  pdf: {
    eyebrow: "PLUS · PDF voor therapeut",
    title: "Neem je resultaat mee",
    body:
      "Een nette PDF van je testresultaat — anoniem, geschikt om met je huisarts of psycholoog te bespreken.",
    bullets: [
      "Score + AI-uitleg in één pagina",
      "Geen e-mail of naam vereist",
      "Inbegrepen in Kompas Plus",
    ],
    cta: "Houd me op de hoogte",
  },
  memory: {
    eyebrow: "PLUS · Geheugen",
    title: "Kompas onthoudt wat speelt",
    body:
      "Geen herhaling van context. Kompas weet wat er vorige week aan de hand was zonder dat je 't opnieuw moet uitleggen.",
    bullets: [
      "Geheugen over al je gesprekken",
      "Jij beheert wat onthouden wordt",
      "Wis ‘t op elk moment",
    ],
    cta: "Houd me op de hoogte",
  },
  community: {
    eyebrow: "PLUS · Gemeenschap",
    title: "Praat met mensen die ‘t snappen",
    body:
      "Anonieme kanalen per thema — ADHD, autisme, burn-out, angst, verlies. Geen echte namen, geen foto’s, gewoon ervaring delen.",
    bullets: [
      "Anoniem — handle wordt gegenereerd",
      "Modereerd, geen toxisch gedrag",
      "Alleen voor Plus-leden",
    ],
    cta: "Houd me op de hoogte",
  },
  voice: {
    eyebrow: "PLUS · Spraak",
    title: "Praat ipv typen",
    body:
      "Hands-free chat met Kompas — handig in de auto of als typen te veel is. Antwoorden komen via tekst, je hoeft niet te luisteren.",
    bullets: ["Vlaamse spraakherkenning", "Pauzes als je nodig hebt", "Plus-feature"],
    cta: "Houd me op de hoogte",
  },
  generic: {
    eyebrow: "KOMPAS PLUS",
    title: "Iets meer Kompas",
    body:
      "Geheugen tussen gesprekken, een anonieme gemeenschap, PDF-export, en méér ruimte om te praten.",
    bullets: [
      "Geheugen over al je gesprekken",
      "Anonieme thema-kanalen",
      "PDF voor therapeut",
      "Geen reclame, alles privé",
    ],
    cta: "Houd me op de hoogte",
  },
};

export function PlusModal({ visible, reason = "generic", onClose, onNotify, testID }: Props) {
  const { palette } = useTheme();
  const copy = COPY[reason];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} testID={testID ?? "plus-modal"}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle}>
            <View style={[styles.handleBar, { backgroundColor: palette.borderEmphasis }]} />
          </View>

          <View style={[styles.eyebrowPill, { backgroundColor: palette.accent }]}>
            <Feather name="zap" size={11} color="#0a0a0a" />
            <Text style={styles.eyebrowText}>{copy.eyebrow}</Text>
          </View>

          <Text
            style={[
              styles.title,
              {
                color: palette.textPrimary,
                fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
              },
            ]}
          >
            {copy.title}
          </Text>
          <Text style={[styles.body, { color: palette.textSecondary }]}>{copy.body}</Text>

          <View style={styles.bullets}>
            {copy.bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Feather name="check" size={14} color={palette.accent} />
                <Text style={[styles.bulletText, { color: palette.textPrimary }]}>{b}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.priceBox, { borderColor: palette.borderSubtle }]}>
            <Text style={[styles.priceLabel, { color: palette.textMuted }]}>Kompas Plus</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceAmount, { color: palette.textPrimary }]}>€4,99</Text>
              <Text style={[styles.priceUnit, { color: palette.textMuted }]}>/ maand</Text>
            </View>
            <Text style={[styles.priceHint, { color: palette.textMuted }]}>
              Of €39 / jaar — opzegbaar wanneer je wil.
            </Text>
          </View>

          <TouchableOpacity
            testID="plus-modal-notify"
            onPress={() => {
              onNotify?.();
              onClose();
            }}
            style={[styles.primaryBtn, { backgroundColor: palette.accent }]}
          >
            <Text style={[styles.primaryBtnText, { color: "#0a0a0a" }]}>{copy.cta}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} testID="plus-modal-close" style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: palette.textMuted }]}>Nu niet</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 28,
    borderWidth: 0.5,
  },
  handle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
    marginBottom: 14,
  },
  eyebrowText: {
    color: "#0a0a0a",
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 30,
    marginBottom: 8,
  },
  body: {
    fontSize: 14.5,
    lineHeight: 21,
    marginBottom: 16,
  },
  bullets: {
    gap: 10,
    marginBottom: 18,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
  },
  priceBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: 13,
  },
  priceHint: {
    fontSize: 12,
    marginTop: 4,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  closeBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  closeText: {
    fontSize: 13,
  },
});
