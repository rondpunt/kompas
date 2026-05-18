import React from "react";
import { View, Image, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { APP_NAME } from "@/src/config/branding";
import { TEXT } from "@/src/theme/tokens";

interface Props {
  size?: number;
  variant?: "mark" | "full" | "wordmark"; // mark = icoon only, full = logo+text, wordmark = text only
  align?: "left" | "center";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SRC = require("../../assets/images/junie-logo.png");

/**
 * Junie multicolor logo. Single source for branding.
 * - `mark`: vierkant icoon (chat/heart-J)
 * - `full`: icoon + woordmerk eronder
 * - `wordmark`: enkel platte tekst (voor topbars met weinig ruimte)
 */
export function JunieLogo({ size = 32, variant = "mark", align = "center", style, testID }: Props) {
  if (variant === "wordmark") {
    return (
      <View style={[styles.wordmark, align === "left" ? { alignSelf: "flex-start" } : null, style]} testID={testID ?? "junie-wordmark"}>
        <Text style={[styles.wordmarkText, { fontSize: Math.round(size * 0.5) }]}>{APP_NAME}</Text>
      </View>
    );
  }

  // Use the colorful logo image. Aspect ratio of the logo (~1:1.25 due to wordmark below the mark).
  const imgWidth = size;
  const imgHeight = variant === "full" ? Math.round(size * 1.25) : size;

  return (
    <View
      style={[
        styles.wrap,
        align === "left" ? { alignSelf: "flex-start" } : null,
        style,
      ]}
      testID={testID ?? "junie-logo"}
    >
      <Image
        source={SRC}
        style={{
          width: imgWidth,
          height: imgHeight,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

/** Backwards-compatible Wordmark export (used by Sidebar/legacy screens). */
export function Wordmark({ size = 15, testID }: { size?: number; testID?: string }) {
  return (
    <View style={styles.row} testID={testID ?? "wordmark"}>
      <Text style={[styles.wordmarkText, { fontSize: size }]}>{APP_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  wordmark: { alignItems: "center", justifyContent: "center" },
  wordmarkText: {
    color: TEXT.primary,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
});
