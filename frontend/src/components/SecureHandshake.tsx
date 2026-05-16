import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  onComplete: () => void;
  /** total duration in ms (default 2000) */
  duration?: number;
  /** small variant uses smaller text/icons for inline use */
  variant?: "full" | "inline";
}

const HEX_CHARS = "0123456789abcdef";
const GLYPHS = "0123456789ABCDEFabcdef!@#$%&*+=/<>?".split("");

function randHex(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
  }
  return out;
}

function randGlyph(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}

const STAGES = [
  { t: 0, label: "Beveiligd kanaal opzetten" },
  { t: 0.35, label: "Sleutels uitwisselen" },
  { t: 0.65, label: "Sessie versleutelen" },
  { t: 0.92, label: "Klaar" },
];

export function SecureHandshake({ onComplete, duration = 2000, variant = "full" }: Props) {
  const { palette } = useTheme();
  const [lines, setLines] = useState<string[]>([]);
  const [stageIdx, setStageIdx] = useState(0);
  const [dots, setDots] = useState("");
  const fade = useRef(new Animated.Value(0)).current;
  const lockScale = useRef(new Animated.Value(0.8)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const startedRef = useRef(false);

  const lineCount = variant === "inline" ? 3 : 6;
  const lineLen = variant === "inline" ? 18 : 28;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Initial fade-in
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    Animated.timing(lockScale, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Glitch lines updater
    const tickGlyph = setInterval(() => {
      const arr: string[] = [];
      for (let i = 0; i < lineCount; i++) {
        // Mix hex stream with occasional glyphs
        const useGlyph = Math.random() < 0.18;
        arr.push(useGlyph ? randGlyph(lineLen) : randHex(lineLen));
      }
      setLines(arr);
    }, 65);

    // Dots animation
    const dotPattern = [".", "..", "..."];
    let dotI = 0;
    const tickDots = setInterval(() => {
      setDots(dotPattern[dotI % dotPattern.length]);
      dotI++;
    }, 350);

    // Stage progression
    const stageTimers: ReturnType<typeof setTimeout>[] = STAGES.map((s, i) =>
      setTimeout(() => setStageIdx(i), s.t * duration),
    );

    // Lock fill / checkmark at ~75% of duration
    const checkTimer = setTimeout(() => {
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }, duration * 0.75);

    // Completion fade out
    const fadeOutTimer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, duration);

    return () => {
      clearInterval(tickGlyph);
      clearInterval(tickDots);
      stageTimers.forEach(clearTimeout);
      clearTimeout(checkTimer);
      clearTimeout(fadeOutTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontSize = variant === "inline" ? 11 : 13;
  const statusSize = variant === "inline" ? 11 : 13;
  const lockSize = variant === "inline" ? 28 : 44;

  const currentLabel = STAGES[stageIdx]?.label ?? "";
  const isFinal = stageIdx === STAGES.length - 1;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { backgroundColor: palette.background, opacity: fade },
      ]}
      pointerEvents="auto"
      testID="secure-handshake"
    >
      <View style={styles.content}>
        {/* Lock icon with check overlay */}
        <Animated.View style={[styles.lockWrap, { transform: [{ scale: lockScale }] }]}>
          <View
            style={[
              styles.lockCircle,
              {
                width: lockSize + 24,
                height: lockSize + 24,
                borderRadius: (lockSize + 24) / 2,
                borderColor: palette.borderEmphasis,
                backgroundColor: palette.surfaceElevated,
              },
            ]}
          >
            <Feather
              name={isFinal ? "lock" : "shield"}
              size={lockSize / 1.7}
              color={isFinal ? palette.accent : palette.textSecondary}
            />
            <Animated.View style={[styles.checkBadge, { opacity: checkOpacity }]}>
              <View
                style={[
                  styles.checkDot,
                  { backgroundColor: palette.accent, borderColor: palette.background },
                ]}
              >
                <Feather name="check" size={10} color="#0a0a0a" />
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Hex stream */}
        <View style={styles.streamBox} testID="secure-handshake-stream">
          {lines.map((line, i) => (
            <Text
              key={i}
              style={{
                fontFamily: "Courier",
                color: i === 0 ? palette.textSecondary : palette.textFaint,
                fontSize,
                lineHeight: fontSize + 4,
                letterSpacing: 1,
                opacity: 1 - i * 0.12,
              }}
              numberOfLines={1}
            >
              {line}
            </Text>
          ))}
        </View>

        {/* Status line */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isFinal ? palette.success : palette.accent },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: palette.textPrimary, fontSize: statusSize },
            ]}
            testID="secure-handshake-status"
          >
            {currentLabel}
            {!isFinal && dots}
          </Text>
        </View>

        <Text style={[styles.subStatus, { color: palette.textMuted }]}>
          End-to-end · AES-256 · privé
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 28,
    width: "100%",
  },
  lockWrap: {
    marginBottom: 28,
  },
  lockCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  streamBox: {
    alignItems: "center",
    marginBottom: 26,
    minHeight: 90,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  subStatus: {
    marginTop: 10,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
