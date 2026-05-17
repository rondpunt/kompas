import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  variant?: "chat" | "result" | "sidebar";
  message?: string;
  onPress: () => void;
  onDismiss: () => void;
  testID?: string;
}

const DEFAULTS: Record<NonNullable<Props["variant"]>, string> = {
  chat: "Onthoud wat speelt, ook over gesprekken heen. Probeer Plus.",
  result: "Bewaar dit resultaat en zie evolutie. Probeer Plus.",
  sidebar: "Alles privé, voor altijd bewaard. Probeer Plus.",
};

export function PlusHintBanner({ variant = "chat", message, onPress, onDismiss, testID }: Props) {
  const { palette } = useTheme();
  const text = message ?? DEFAULTS[variant];
  return (
    <View
      testID={testID ?? "plus-hint"}
      style={[
        styles.wrap,
        {
          backgroundColor: palette.accentSoft,
          borderColor: palette.accent + "55",
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: palette.accent }]}>
        <Feather name="zap" size={12} color="#0a0a0a" />
      </View>
      <TouchableOpacity onPress={onPress} style={styles.textBtn} activeOpacity={0.7}>
        <Text style={[styles.text, { color: palette.textPrimary }]} numberOfLines={2}>
          {text}
        </Text>
        <Feather name="chevron-right" size={14} color={palette.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} testID="plus-hint-dismiss">
        <Feather name="x" size={14} color={palette.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 0.5,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#f59e0b",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 0 },
    }),
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  textBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  dismissBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
