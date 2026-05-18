import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { BRAND, RADII, TYPE } from "@/src/theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
  style?: ViewStyle;
}

const SIZE_MAP: Record<Size, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: 14, fontSize: 13 },
  md: { height: 44, px: 20, fontSize: 15 },
  lg: { height: 52, px: 24, fontSize: 16 },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  testID,
  style,
}: ButtonProps) {
  const s = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    height: s.height,
    paddingHorizontal: s.px,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    alignSelf: fullWidth ? "stretch" : "flex-start",
    opacity: isDisabled ? 0.55 : 1,
    ...(variant === "primary" && {
      backgroundColor: BRAND.blue,
      ...Platform.select({
        ios: {
          shadowColor: BRAND.blue,
          shadowOpacity: 0.30,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 4 },
      }),
    }),
    ...(variant === "secondary" && {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: BRAND.blue,
    }),
    ...(variant === "ghost" && {
      backgroundColor: "transparent",
    }),
    ...(variant === "danger" && {
      backgroundColor: "#EF4444",
      ...Platform.select({
        ios: {
          shadowColor: "#EF4444",
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        },
        android: { elevation: 3 },
      }),
    }),
    ...(style as object),
  };

  const labelColor =
    variant === "primary" || variant === "danger"
      ? "#FFFFFF"
      : variant === "secondary"
      ? BRAND.blue
      : "#111111";

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.78}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <Text
          style={{
            color: labelColor,
            fontSize: s.fontSize,
            fontWeight: "600",
            letterSpacing: -0.1,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
