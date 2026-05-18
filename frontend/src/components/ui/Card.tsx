import React from "react";
import { View, StyleSheet, Platform, ViewStyle } from "react-native";
import { LAYERS, BORDER, RADII, BRAND } from "@/src/theme/tokens";

type CardVariant = "default" | "elevated" | "colored" | "flat";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  accentColor?: string;
  style?: ViewStyle;
  testID?: string;
}

export function Card({ children, variant = "default", accentColor, style, testID }: CardProps) {
  const baseStyle: ViewStyle = {
    backgroundColor: LAYERS.card,
    borderRadius: RADII.lg,
    padding: 16,
    ...(variant === "default" && {
      borderWidth: 0.5,
      borderColor: BORDER.subtle,
    }),
    ...(variant === "elevated" && {
      borderWidth: 0.5,
      borderColor: BORDER.subtle,
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
        android: { elevation: 3 },
      }),
    }),
    ...(variant === "colored" && {
      borderTopWidth: 3,
      borderTopColor: accentColor || BRAND.blue,
      borderWidth: 0.5,
      borderColor: BORDER.subtle,
      ...Platform.select({
        ios: { shadowColor: accentColor || BRAND.blue, shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
        android: { elevation: 2 },
      }),
    }),
    ...(variant === "flat" && {
      backgroundColor: LAYERS.sidebar,
      borderWidth: 0,
    }),
    ...(style as object),
  };
  return <View testID={testID} style={baseStyle}>{children}</View>;
}
