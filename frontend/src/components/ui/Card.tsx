import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LAYERS, BORDER, RADII, shadow } from "@/src/theme/tokens";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "static" | "tappable" | "elevated"; // elevated = popover-laag
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  highlight?: boolean; // toon de inner-highlight bovenaan
  bare?: boolean; // geen border/shadow
}

/**
 * Premium card op Laag 2.
 * - subtle gradient (2% top→bottom)
 * - inner-highlight bovenaan
 * - 2-laags schaduw
 */
export function Card({ children, onPress, variant = "static", padding = 20, style, testID, highlight = true, bare = false }: Props) {
  const Inner = (
    <View
      style={[
        styles.base,
        {
          padding,
          borderRadius: RADII.lg,
        },
        !bare && {
          borderWidth: 1,
          borderColor: BORDER.subtle,
        },
        variant !== "elevated" ? shadow("sm") : shadow("md"),
        style,
      ]}
      testID={testID}
    >
      <LinearGradient
        colors={variant === "elevated" ? [LAYERS.popover, "#262626"] : ["#262626", "#222222"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: RADII.lg }]}
      />
      {highlight ? (
        <View pointerEvents="none" style={styles.innerHighlight} />
      ) : null}
      <View style={{ position: "relative" }}>{children}</View>
    </View>
  );

  if (onPress || variant === "tappable") {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    position: "relative",
  },
  innerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: BORDER.topHighlight,
  },
});
