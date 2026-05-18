import React from "react";
import { View, Text, StyleSheet, Image, Platform, StyleProp, ViewStyle } from "react-native";
import { APP_NAME } from "@/src/config/branding";
import { BRAND, TEXT, JUNIE_GRADIENT } from "@/src/theme/tokens";

interface Props {
  size?: number; // tekst-fontsize
  variant?: "mark" | "full" | "wordmark" | "multicolor";
  align?: "left" | "center";
  monochrome?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SRC = require("../../assets/images/junie-logo.png");

/**
 * Junie logo / wordmark.
 *  - `mark` → vierkant kleurig icoon (PNG)
 *  - `full` → mark + woordmerk eronder
 *  - `wordmark` → enkel platte tekst (monochroom of accent)
 *  - `multicolor` → vijf-kleur woordmerk (j-u-n-i-e), gebruik in hero/onboarding
 */
export function JunieLogo({ size = 32, variant = "mark", align = "center", monochrome = false, style, testID }: Props) {
  if (variant === "multicolor") {
    return <MulticolorWordmark size={size} align={align} style={style} testID={testID ?? "junie-multicolor"} />;
  }

  if (variant === "wordmark") {
    return (
      <View style={[styles.wordmark, align === "left" ? { alignSelf: "flex-start" } : null, style]} testID={testID ?? "junie-wordmark"}>
        <Text style={[styles.wordmarkText, { fontSize: size, color: monochrome ? TEXT.primary : BRAND.blue }]}>{APP_NAME}</Text>
      </View>
    );
  }

  const imgWidth = size;
  const imgHeight = variant === "full" ? Math.round(size * 1.25) : size;

  return (
    <View style={[styles.wrap, align === "left" ? { alignSelf: "flex-start" } : null, style]} testID={testID ?? "junie-logo"}>
      <Image source={SRC} style={{ width: imgWidth, height: imgHeight }} resizeMode="contain" />
    </View>
  );
}

function MulticolorWordmark({ size = 48, align = "center", style, testID }: { size?: number; align?: "left" | "center"; style?: StyleProp<ViewStyle>; testID?: string }) {
  // Junie wordmark in vijf merkkleuren — Nunito-stijl, extra-bold.
  const letters = APP_NAME.toLowerCase().split("");
  return (
    <View
      style={[
        styles.multiRow,
        align === "left" ? { alignSelf: "flex-start" } : null,
        style,
      ]}
      testID={testID}
    >
      {letters.map((ch, i) => (
        <Text
          key={`${ch}${i}`}
          style={[
            styles.multiLetter,
            {
              fontSize: size,
              color: JUNIE_GRADIENT[i % JUNIE_GRADIENT.length],
              fontFamily: Platform.select({ ios: "Nunito", android: "sans-serif", default: "system-ui" }),
            },
          ]}
        >
          {ch}
        </Text>
      ))}
    </View>
  );
}

/** Backwards-compat shim. */
export function Wordmark({ size = 18, testID }: { size?: number; testID?: string }) {
  return (
    <View style={styles.row} testID={testID ?? "wordmark"}>
      <Text style={[styles.wordmarkText, { fontSize: size, color: TEXT.primary }]}>{APP_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  wordmark: { alignItems: "center", justifyContent: "center" },
  wordmarkText: {
    fontWeight: "700",
    letterSpacing: -0.4,
    fontFamily: Platform.select({ ios: "Nunito", android: "sans-serif", default: "system-ui" }),
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  multiRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "center" },
  multiLetter: {
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: undefined,
  },
});
