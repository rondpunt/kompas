import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { Wordmark } from "@/src/components/Wordmark";
import { storage } from "@/src/utils/storage";

interface Slide {
  icon?: keyof typeof Feather.glyphMap;
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
}

// 4 slides — hook-driven, no signup pressure, no Plus mention.
// Tone: Belgian Dutch, anti-self-optimization, "verwijlen".
const SLIDES: Slide[] = [
  {
    eyebrow: "Welkom",
    title: "Wat speelt er?",
    body:
      "Geen therapeut. Geen coach. Geen badges of streaks.\n\nGewoon een plek waar je kan zeggen wat speelt — werk, relatie, ouders, dagen die niet meewerken.",
  },
  {
    icon: "feather",
    eyebrow: "Zo werkt het",
    title: "Twee zinnen volstaan",
    body:
      "Je hoeft niet wijdlopig te zijn. Eén lijn over wat speelt is genoeg om te starten.\n\nKompas vraagt eerst door, voor er iets gezegd wordt. Geen tips-en-tricks, geen 'wat goed dat je dit deelt'.",
  },
  {
    icon: "lock",
    eyebrow: "Privé",
    title: "Wat je deelt blijft van jou",
    body:
      "Kompas verzamelt zo weinig mogelijk. Anoniem in gebruik. Niets wordt doorverkocht of gedeeld.",
    bullets: [
      "Geen email, geen telefoon nodig",
      "Versleuteld kanaal voor elk gesprek",
      "Geen reclame, geen tracking, niet gedeeld met derden",
      "Jij wist je geschiedenis wanneer je wil",
    ],
  },
  {
    icon: "compass",
    eyebrow: "Klaar?",
    title: "Begin met één lijn",
    body:
      "Schrijf wat eerst opkomt. Een gevoel, een gedachte, een dag. Geen goed of fout begin.\n\nKompas is geen vervanging voor professionele zorg — wel een plek tussendoor.",
  },
];

const ONBOARDED_KEY = "kompas.onboarded";

export default function Onboarding() {
  const { palette } = useTheme();
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  const next = () => {
    if (idx < SLIDES.length - 1) {
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
        setIdx(idx + 1);
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    } else {
      finish();
    }
  };

  const prev = () => {
    if (idx === 0) return;
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setIdx(idx - 1);
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const finish = async () => {
    await storage.setItem(ONBOARDED_KEY, true);
    router.replace("/");
  };

  const skip = () => finish();

  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          {idx > 0 ? (
            <TouchableOpacity testID="onboarding-prev" onPress={prev} style={styles.iconBtn}>
              <Feather name="chevron-left" size={20} color={palette.textMuted} />
            </TouchableOpacity>
          ) : (
            <Wordmark size={15} />
          )}
        </View>
        <TouchableOpacity testID="onboarding-skip" onPress={skip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: palette.textMuted }]}>Overslaan</Text>
        </TouchableOpacity>
      </View>

      {/* Slide content */}
      <Animated.View style={[styles.slideWrap, { opacity: fade }]} testID={`onboarding-slide-${idx}`}>
        <ScrollView contentContainerStyle={styles.slideScroll} showsVerticalScrollIndicator={false}>
          {slide.icon && (
            <View
              style={[
                styles.iconCircle,
                {
                  borderColor: palette.accent + "55",
                  backgroundColor: palette.accentSoft,
                },
              ]}
            >
              <Feather name={slide.icon} size={26} color={palette.accent} />
            </View>
          )}

          {slide.eyebrow && (
            <Text style={[styles.eyebrow, { color: palette.accent }]}>
              {slide.eyebrow.toUpperCase()}
            </Text>
          )}

          <Text style={[styles.title, { color: palette.textPrimary }]}>{slide.title}</Text>

          <Text style={[styles.body, { color: palette.textSecondary }]}>{slide.body}</Text>

          {slide.bullets && (
            <View style={styles.bullets}>
              {slide.bullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Feather name="check" size={14} color={palette.accent} />
                  <Text style={[styles.bulletText, { color: palette.textSecondary }]}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === idx ? palette.accent : palette.borderEmphasis,
                width: i === idx ? 22 : 6,
              },
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          testID="onboarding-next"
          onPress={next}
          activeOpacity={0.85}
          style={[styles.cta, { backgroundColor: palette.textPrimary }]}
        >
          <Text style={[styles.ctaText, { color: palette.inversePrimary }]}>
            {isLast ? "Begin" : "Verder"}
          </Text>
          <Feather name="arrow-right" size={16} color={palette.inversePrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: palette.textFaint }]}>
          •Kompas
        </Text>
      </View>
    </SafeAreaView>
  );
}

export async function hasOnboarded(): Promise<boolean> {
  const v = await storage.getItem<boolean>(ONBOARDED_KEY, false);
  return v === true;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  slideWrap: {
    flex: 1,
    paddingHorizontal: 28,
  },
  slideScroll: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "500",
    lineHeight: 42,
    fontStyle: "italic",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
  },
  bullets: {
    marginTop: 22,
    gap: 14,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 21,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  ctaWrap: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 8,
  },
  cta: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    fontSize: 15.5,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  footer: {
    paddingVertical: 14,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 1,
  },
});
