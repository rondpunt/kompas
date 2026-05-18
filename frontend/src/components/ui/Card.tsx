import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from "react-native";
import { LAYERS, BORDER, RADII, shadow } from "@/src/theme/tokens";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "static" | "tappable" | "elevated";
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  bare?: boolean;
}

/**
 * Premium card — wit oppervlak op canvas met subtiele border + zachte 2-laags schaduw.
 */
export function Card({ children, onPress, variant = "static", padding = 20, style, testID, bare = false }: Props) {
  const Inner = (
    <View
      style={[
        styles.base,
        {
          padding,
          borderRadius: RADII.lg,
          backgroundColor: LAYERS.card,
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
      {children}
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
});
