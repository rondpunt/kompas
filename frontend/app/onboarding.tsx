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

const SLIDES: Slide[] = [
  {
    title: "Wat speelt er?",
    body: "Kompas is geen therapeut. Geen coach. Geen tool met badges of streaks.\n\nGewoon een plek waar je kan zeggen wat speelt — werk, relatie, ouders, dagen die niet meewerken. Twee tot vier zinnen tegelijk. Soms één.",
    eyebrow: "Welkom",
  },
  {
    icon: "compass",
    eyebrow: "Hoe werkt het",
    title: "Verwijlen, niet fixen",
    body: "Kompas vraagt eerst door voor er iets gezegd wordt. Geen 'tips en tricks', geen 'wat goed dat je dit deelt'. Imperfectie is hier OK.\n\nWanneer er iets specifieks speelt — concentratie, neerslachtigheid, piekeren — kan Kompas één korte zelftest voorstellen. Vrijblijvend.",
  },
  {
    icon: "lock",
    eyebrow: "Privé",
    title: "Wat je deelt blijft van jou",
    body: "Kompas verzamelt zo weinig mogelijk en doet niets met wat je deelt buiten dit gesprek.",
    bullets: [
      "Anoniem in gebruik — geen email, geen telefoon",
      "Versleuteld kanaal voor elk gesprek",
      "Geen reclame, geen tracking, niet gedeeld met derden",
      "Jij beheert je geschiedenis — wis wanneer je wil",
    ],
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
        <Wordmark size={15} />
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
                { borderColor: palette.borderEmphasis, backgroundColor: palette.surfaceElevated },
              ]}
            >
              <Feather name={slide.icon} size={26} color={palette.accent} />
            </View>
          )}

          {slide.eyebrow && (
            <Text style={[styles.eyebrow, { color: palette.textMuted }]}>
              {slide.eyebrow.toUpperCase()}
            </Text>
          )}

          <Text style={[styles.title, { color: palette.textPrimary }]}>
            {slide.title}
          </Text>

          <Text style={[styles.body, { color: palette.textSecondary }]}>
            {slide.body}
          </Text>

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
                width: i === idx ? 18 : 6,
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
          style={[styles.cta, { backgroundColor: palette.textPrimary }]}
        >
          <Text style={[styles.ctaText, { color: palette.inversePrimary }]}>
            {isLast ? "Open Kompas" : "Verder"}
          </Text>
          <Feather name="arrow-right" size={16} color={palette.inversePrimary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { borderTopColor: palette.borderSubtle }]}>
        <Text style={[styles.footerText, { color: palette.textMuted }]}>
          Kompas is geen vervanging voor professionele zorg.
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
    paddingHorizontal: 24,
  },
  slideScroll: {
    paddingVertical: 32,
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    lineHeight: 36,
    fontStyle: "italic",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  body: {
    fontSize: 15.5,
    lineHeight: 24,
  },
  bullets: {
    marginTop: 18,
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  ctaWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  cta: {
    height: 50,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    alignItems: "center",
  },
  footerText: {
    fontSize: 10.5,
    textAlign: "center",
  },
});
