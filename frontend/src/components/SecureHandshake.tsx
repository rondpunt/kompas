import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  onComplete: () => void;
  /** total duration in ms (default 4200) */
  duration?: number;
  /** small variant uses smaller text/icons for inline use */
  variant?: "full" | "inline";
}

const HEX_CHARS = "0123456789abcdef";

function randHex(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
  }
  return out;
}

interface Stage {
  /** progress 0..1 at which this stage begins */
  t: number;
  label: string;
  /** technical log lines for this stage */
  logs: string[];
}

const STAGES: Stage[] = [
  {
    t: 0,
    label: "Beveiligd kanaal opzetten",
    logs: [
      "$ kompas-secure --init",
      "› resolving endpoint ...",
      "› endpoint OK · latency 38ms",
      "› TLS 1.3 handshake initiated",
    ],
  },
  {
    t: 0.25,
    label: "Sleutels uitwisselen",
    logs: [
      "› generating ephemeral keypair (X25519)",
      "› ECDHE ...",
      "› peer certificate verified",
      "› shared secret derived",
    ],
  },
  {
    t: 0.55,
    label: "Sessie versleutelen",
    logs: [
      "› cipher · AES-256-GCM",
      "› HKDF-SHA256 session keys ok",
      "› forward-secrecy enabled",
      "› channel sealed",
    ],
  },
  {
    t: 0.85,
    label: "Klaar",
    logs: [
      "› integrity verified",
      "› identity · anoniem",
      "✓ veilig · privé · end-to-end",
    ],
  },
];

export function SecureHandshake({ onComplete, duration = 4200, variant = "full" }: Props) {
  const { palette } = useTheme();
  const [hexLines, setHexLines] = useState<string[]>([]);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const fade = useRef(new Animated.Value(0)).current;
  const lockScale = useRef(new Animated.Value(0.85)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const startedRef = useRef(false);

  const hexLineCount = variant === "inline" ? 2 : 4;
  const hexLineLen = variant === "inline" ? 18 : 26;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Initial fade-in
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    Animated.timing(lockScale, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Pulse ring loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ringPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Progress bar 0→1 over duration
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    const progressListener = progressAnim.addListener(({ value }) => {
      setProgress(value);
    });

    // Hex stream tick
    const tickHex = setInterval(() => {
      const arr: string[] = [];
      for (let i = 0; i < hexLineCount; i++) {
        arr.push(randHex(hexLineLen).replace(/(.{4})/g, "$1 ").trim());
      }
      setHexLines(arr);
    }, 85);

    // Dots animation
    const dotPattern = ["", ".", "..", "..."];
    let dotI = 0;
    const tickDots = setInterval(() => {
      setDots(dotPattern[dotI % dotPattern.length]);
      dotI++;
    }, 300);

    // Push log lines progressively
    let allLogs: { stage: number; line: string; at: number }[] = [];
    STAGES.forEach((stg, si) => {
      const stageStart = stg.t * duration;
      const stageEnd = (si === STAGES.length - 1 ? 1 : STAGES[si + 1].t) * duration;
      const slotW = (stageEnd - stageStart) / Math.max(1, stg.logs.length);
      stg.logs.forEach((line, li) => {
        allLogs.push({ stage: si, line, at: stageStart + li * slotW + slotW * 0.25 });
      });
    });
    const logTimers = allLogs.map((entry) =>
      setTimeout(() => {
        setLogLines((prev) => {
          // keep last 6 only
          const next = [...prev, entry.line];
          return next.slice(Math.max(0, next.length - 6));
        });
      }, entry.at),
    );

    // Stage progression
    const stageTimers = STAGES.map((s, i) =>
      setTimeout(() => setStageIdx(i), s.t * duration),
    );

    // Final lock check
    const checkTimer = setTimeout(() => {
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }).start();
    }, duration * 0.85);

    // Completion fade out
    const fadeOutTimer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, duration);

    return () => {
      clearInterval(tickHex);
      clearInterval(tickDots);
      logTimers.forEach(clearTimeout);
      stageTimers.forEach(clearTimeout);
      clearTimeout(checkTimer);
      clearTimeout(fadeOutTimer);
      progressAnim.removeListener(progressListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lockSize = variant === "inline" ? 28 : 52;
  const currentLabel = STAGES[stageIdx]?.label ?? "";
  const isFinal = stageIdx === STAGES.length - 1;
  const pct = Math.min(100, Math.round(progress * 100));

  const ringScale = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const ringOpacity = ringPulse.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.45, 0.25, 0] });

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
        {/* Lock icon with pulse ring and check overlay */}
        <Animated.View style={[styles.lockWrap, { transform: [{ scale: lockScale }] }]}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: lockSize + 80,
                height: lockSize + 80,
                borderRadius: (lockSize + 80) / 2,
                borderColor: palette.accent,
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          <View
            style={[
              styles.lockCircle,
              {
                width: lockSize + 32,
                height: lockSize + 32,
                borderRadius: (lockSize + 32) / 2,
                borderColor: palette.accent + "55",
                backgroundColor: palette.surfaceElevated,
              },
            ]}
          >
            <Feather
              name={isFinal ? "lock" : "shield"}
              size={lockSize / 1.8}
              color={isFinal ? palette.accent : palette.textSecondary}
            />
            <Animated.View style={[styles.checkBadge, { opacity: checkOpacity }]}>
              <View
                style={[
                  styles.checkDot,
                  { backgroundColor: palette.accent, borderColor: palette.background },
                ]}
              >
                <Feather name="check" size={11} color="#0a0a0a" />
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Hex stream */}
        <View style={styles.streamBox}>
          {hexLines.map((line, i) => (
            <Text
              key={i}
              style={[
                styles.hexLine,
                {
                  color: i === 0 ? palette.accent : palette.textFaint,
                  opacity: 1 - i * 0.18,
                },
              ]}
              numberOfLines={1}
            >
              {line}
            </Text>
          ))}
        </View>

        {/* Log lines (terminal-style) */}
        <View
          style={[
            styles.logBox,
            {
              backgroundColor: palette.surfaceElevated,
              borderColor: palette.borderSubtle,
            },
          ]}
          testID="secure-handshake-log"
        >
          {logLines.length === 0 ? (
            <Text style={[styles.logLine, { color: palette.textFaint }]}>$ kompas-secure --init</Text>
          ) : (
            logLines.map((l, i) => {
              const isCmd = l.startsWith("$");
              const isOk = l.startsWith("✓");
              return (
                <Text
                  key={`${i}-${l}`}
                  style={[
                    styles.logLine,
                    {
                      color: isOk
                        ? palette.success
                        : isCmd
                        ? palette.textSecondary
                        : palette.textMuted,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {l}
                </Text>
              );
            })
          )}
        </View>

        {/* Progress bar */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: palette.surfaceHigher },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${pct}%`,
                backgroundColor: palette.accent,
              },
            ]}
          />
        </View>

        {/* Status row */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isFinal ? palette.success : palette.accent },
            ]}
          />
          <Text style={[styles.statusText, { color: palette.textPrimary }]} testID="secure-handshake-status">
            {currentLabel}
            {!isFinal && dots}
          </Text>
          <Text style={[styles.statusPct, { color: palette.textMuted }]}>{pct}%</Text>
        </View>

        <Text style={[styles.subStatus, { color: palette.textFaint }]}>
          End-to-end · AES-256-GCM · privé
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
    maxWidth: 460,
  },
  lockWrap: {
    marginBottom: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1,
  },
  lockCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  streamBox: {
    alignItems: "center",
    marginBottom: 18,
    minHeight: 60,
  },
  hexLine: {
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
  },
  logBox: {
    width: "100%",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    minHeight: 96,
    marginBottom: 16,
  },
  logLine: {
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  progressTrack: {
    width: "100%",
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
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
    fontSize: 13,
  },
  statusPct: {
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
    fontSize: 11.5,
    marginLeft: 4,
  },
  subStatus: {
    marginTop: 12,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
