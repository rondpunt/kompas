import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  onComplete: () => void;
  /** "full" plays the 4.2s first-install version with a CTA the user must tap.
   *  "short" plays a 1.1s cold-start variant that auto-dismisses. */
  variant?: "full" | "short";
}

// Spec colors — warm dark premium (matches Junie main theme)
const COLORS = {
  primary: "#f59e0b",
  primaryDark: "#b45309",
  primaryLight: "rgba(245, 158, 11, 0.16)",
  primaryLightSoft: "rgba(245, 158, 11, 0.08)",
  ringStroke: "rgba(245, 158, 11, 0.35)",
  glow: "rgba(245, 158, 11, 0.18)",
  badgeBg: "rgba(245, 158, 11, 0.12)",
  badgeText: "#fbbf24",
};

const STEPS = ["Verbinding beveiligd", "Sleutels aangemaakt", "Berichten versleuteld"];

export function SecureHandshake({ onComplete, variant = "full" }: Props) {
  const { palette } = useTheme();
  const [stepDone, setStepDone] = useState<boolean[]>([false, false, false]);
  const [ctaReady, setCtaReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const startedRef = useRef(false);

  // Animation values
  const screenFade = useRef(new Animated.Value(0)).current;
  const stepSlide0 = useRef(new Animated.Value(0)).current;
  const stepSlide1 = useRef(new Animated.Value(0)).current;
  const stepSlide2 = useRef(new Animated.Value(0)).current;
  const stepSlides = [stepSlide0, stepSlide1, stepSlide2];
  const progressW = useRef(new Animated.Value(0)).current;
  const lockRotate = useRef(new Animated.Value(variant === "short" ? 0 : 1)).current; // 1=open, 0=closed
  const lockY = useRef(new Animated.Value(variant === "short" ? 0 : 1)).current;
  const lockIconLockOpacity = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const subTextFade = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => setReduceMotion(!!v)).catch(() => {});

    if (variant === "short") {
      runShort();
    } else {
      runFull();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Full version (4.2 s with CTA) ────────────────────────────────
  const runFull = () => {
    // 0–400ms: scherm fade-in
    Animated.timing(screenFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // 400–1000ms: drie stap-pills schuiven van links naar rechts (staggered 100ms)
    setTimeout(() => {
      stepSlides.forEach((sv, i) => {
        Animated.timing(sv, {
          toValue: 1,
          duration: 350,
          delay: i * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }, 400);

    // 1000ms, 1700ms, 2400ms: stappen worden groen + vinkje, balk vult mee
    [1000, 1700, 2400].forEach((t, i) => {
      setTimeout(() => {
        setStepDone((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        Animated.timing(progressW, {
          toValue: (i + 1) / 3,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }, t);
    });

    // 2400–2900ms: slot sluit met verende animatie
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(lockRotate, {
          toValue: 0,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(lockY, {
          toValue: 0,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(lockIconLockOpacity, {
          toValue: 1,
          duration: 280,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2400);

    // 2900–3600ms: pulse-ringen + achtergrond-gloed + badge
    setTimeout(() => {
      [ring1, ring2, ring3].forEach((rv, i) => {
        setTimeout(() => {
          Animated.timing(rv, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }, i * 350);
      });
      Animated.spring(glow, {
        toValue: 1,
        tension: 25,
        friction: 5,
        useNativeDriver: true,
      }).start();
      Animated.timing(badgeFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2900);

    // 3600–4200ms: hoofd- + subtekst, daarna CTA
    setTimeout(() => {
      Animated.timing(textFade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(subTextFade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }).start();
      }, 150);
      Animated.timing(ctaFade, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }, 3600);

    // 4200ms: CTA klikbaar
    setTimeout(() => setCtaReady(true), 4200);
  };

  // ─── Short version (≈1.1 s, auto-dismiss) ─────────────────────────
  const runShort = () => {
    Animated.timing(screenFade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    // Slot sluit meteen
    Animated.parallel([
      Animated.spring(lockRotate, { toValue: 0, tension: 80, friction: 5, useNativeDriver: true }),
      Animated.spring(lockY, { toValue: 0, tension: 80, friction: 5, useNativeDriver: true }),
      Animated.timing(lockIconLockOpacity, {
        toValue: 1,
        duration: 280,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
    // Badge na 500ms
    setTimeout(() => {
      Animated.timing(badgeFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 500);
    // Subtekst-fade na 800ms
    setTimeout(() => {
      Animated.timing(subTextFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 800);
    // Dismiss na 1100ms (totaal ~1.1s)
    setTimeout(() => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, 1100);
  };

  // ─── Press handler — CTA, full version only ──────────────────────
  const handleCtaPress = () => {
    if (!ctaReady) return;
    Animated.sequence([
      Animated.timing(ctaScale, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.timing(ctaScale, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start(() => onComplete());
  };

  // ─── Derived animated values ─────────────────────────────────────
  const lockRotateDeg = lockRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-8deg"],
  });
  const lockTranslateY = lockY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const ringStyle = (rv: Animated.Value) => ({
    transform: [
      {
        scale: rv.interpolate({ inputRange: [0, 1], outputRange: [0.8, 3.5] }),
      },
    ],
    opacity: rv.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.55, 0] }),
  });

  const glowStyle = {
    opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
    transform: [
      {
        scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
      },
    ],
  };

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        {
          opacity: screenFade,
          backgroundColor: palette.background,
        },
      ]}
      pointerEvents="auto"
      testID="secure-handshake"
      accessibilityLabel="Beveiliging actief"
    >
      <View style={styles.content}>
        {/* Background glow + ringen rondom slot */}
        <View style={styles.lockStack}>
          <Animated.View
            pointerEvents="none"
            style={[styles.glow, glowStyle]}
          />
          <Animated.View style={[styles.ring, ringStyle(ring1)]} pointerEvents="none" />
          <Animated.View style={[styles.ring, ringStyle(ring2)]} pointerEvents="none" />
          <Animated.View style={[styles.ring, ringStyle(ring3)]} pointerEvents="none" />

          <Animated.View
            style={[
              styles.lockHolder,
              {
                transform: [{ translateY: lockTranslateY }, { rotate: lockRotateDeg }],
              },
            ]}
          >
            <View style={styles.lockIconWrap}>
              <Feather name="unlock" size={48} color={COLORS.primary} />
              <Animated.View style={[StyleSheet.absoluteFill, styles.lockIconLockOverlay, { opacity: lockIconLockOpacity }]}>
                <Feather name="lock" size={48} color={COLORS.primary} />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Badge rechtsboven */}
          <Animated.View
            style={[
              styles.badge,
              {
                opacity: badgeFade,
                backgroundColor: COLORS.badgeBg,
                borderColor: COLORS.primary + "33",
              },
            ]}
          >
            <Feather name="shield" size={10} color={COLORS.badgeText} />
            <Text style={[styles.badgeText, { color: COLORS.badgeText }]}>End-to-end versleuteld</Text>
          </Animated.View>
        </View>

        {/* Volledige variant: stap-pills + voortgangsbalk */}
        {variant === "full" && (
          <>
            <View style={styles.stepsWrap}>
              {STEPS.map((label, i) => {
                const done = stepDone[i];
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.stepPill,
                      {
                        opacity: stepSlides[i],
                        transform: [
                          {
                            translateX: stepSlides[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: [-30, 0],
                            }),
                          },
                        ],
                        backgroundColor: done ? COLORS.primaryLight : palette.surfaceElevated,
                        borderColor: done ? COLORS.primary + "44" : palette.borderSubtle,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.stepDot,
                        { backgroundColor: done ? COLORS.primary : palette.borderEmphasis },
                      ]}
                    >
                      {done ? (
                        <Feather name="check" size={11} color="#ffffff" />
                      ) : (
                        <Text style={styles.stepIndex}>{i + 1}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        { color: done ? COLORS.primaryDark : palette.textPrimary },
                      ]}
                    >
                      {label}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>

            <View style={[styles.progressTrack, { backgroundColor: palette.surfaceHigher }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: COLORS.primary,
                    width: progressW.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          </>
        )}

        {/* Hoofdtekst */}
        <Animated.View
          style={[
            styles.textBlock,
            {
              opacity: textFade,
              transform: [
                {
                  translateY: textFade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.headTitle, { color: palette.textPrimary }]}>
            Jouw berichten zijn afgeschermd
          </Text>
        </Animated.View>

        {/* Subtekst — komt iets later, ook in short variant */}
        <Animated.View
          style={[
            styles.subTextBlock,
            {
              opacity: subTextFade,
              transform: [
                {
                  translateY: subTextFade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.subText, { color: palette.textMuted }]}>
            Alleen jij kunt ze lezen. Niemand anders — ook wij niet.
          </Text>
        </Animated.View>

        {/* CTA — alleen in full variant */}
        {variant === "full" && (
          <Animated.View
            style={[
              styles.ctaWrap,
              { opacity: ctaFade, transform: [{ scale: ctaScale }] },
            ]}
            pointerEvents={ctaReady ? "auto" : "none"}
          >
            <TouchableOpacity
              testID="secure-handshake-cta"
              activeOpacity={0.85}
              onPress={handleCtaPress}
              disabled={!ctaReady}
              style={[
                styles.ctaBtn,
                {
                  backgroundColor: COLORS.primary,
                  opacity: ctaReady ? 1 : 0.4,
                },
              ]}
            >
              <Text style={styles.ctaText}>Veilig verder</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    paddingHorizontal: 28,
  },
  content: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  lockStack: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.glow,
  },
  ring: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    borderColor: COLORS.ringStroke,
  },
  lockHolder: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary + "33",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  lockIconWrap: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  lockIconLockOverlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: -10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  stepsWrap: {
    width: "100%",
    gap: 8,
    marginBottom: 14,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndex: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  stepText: {
    fontSize: 13.5,
    fontWeight: "500",
    flex: 1,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  textBlock: {
    width: "100%",
    alignItems: "center",
  },
  headTitle: {
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: -0.2,
    textAlign: "center",
    marginBottom: 8,
  },
  subTextBlock: {
    width: "100%",
    alignItems: "center",
  },
  subText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 6,
  },
  ctaWrap: {
    marginTop: 24,
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
  },
  ctaBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  ctaText: {
    color: "#0a0a0a",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
