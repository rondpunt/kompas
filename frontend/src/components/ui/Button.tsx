import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import {
  BRAND,
  BORDER,
  RADII,
  TEXT,
  JUNIE_GRADIENT,
  glowBlue,
  shadow,
} from "@/src/theme/tokens";

type Variant = "primary" | "secondary" | "tertiary" | "rainbow" | "danger";
type Size = "sm" | "md" | "lg";

interface Props {
  label?: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Feather.glyphMap;
  iconRight?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children?: React.ReactNode;
}

const HEIGHT_MAP: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
const PAD_X_MAP: Record<Size, number> = { sm: 14, md: 20, lg: 24 };
const FS_MAP: Record<Size, number> = { sm: 14, md: 15, lg: 16 };

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID,
  children,
}: Props) {
  const height = HEIGHT_MAP[size];
  const pad = PAD_X_MAP[size];
  const fs = FS_MAP[size];
  const radius = RADII.sm; // 8px (chatgpt-stijl knoppen)

  const isInert = disabled || loading;

  const InnerContent = (
    <View style={[styles.row, { paddingHorizontal: pad }]}>
      {icon ? <Feather name={icon} size={fs + 1} color={iconColor(variant)} /> : null}
      {loading ? (
        <ActivityIndicator size="small" color={iconColor(variant)} />
      ) : children ? (
        children
      ) : (
        <Text style={[styles.label, { fontSize: fs, color: textColor(variant) }]} numberOfLines={1}>
          {label}
        </Text>
      )}
      {iconRight ? <Feather name={iconRight} size={fs + 1} color={iconColor(variant)} /> : null}
    </View>
  );

  const outerStyle: StyleProp<ViewStyle> = [
    {
      height,
      borderRadius: radius,
      overflow: "hidden",
      opacity: disabled ? 0.6 : 1,
    },
    fullWidth ? { alignSelf: "stretch" } : null,
    variant === "primary" ? glowBlue("soft") : null,
    variant === "rainbow" ? glowBlue("strong") : null,
    style,
  ];

  if (variant === "primary") {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={isInert ? 1 : 0.85}
        onPress={isInert ? undefined : onPress}
        disabled={isInert}
        style={outerStyle}
      >
        <LinearGradient
          colors={[BRAND.blueLight, BRAND.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {InnerContent}
      </TouchableOpacity>
    );
  }

  if (variant === "rainbow") {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={isInert ? 1 : 0.85}
        onPress={isInert ? undefined : onPress}
        disabled={isInert}
        style={outerStyle}
      >
        <LinearGradient
          colors={JUNIE_GRADIENT as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {InnerContent}
      </TouchableOpacity>
    );
  }

  if (variant === "secondary") {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={isInert ? 1 : 0.75}
        onPress={isInert ? undefined : onPress}
        disabled={isInert}
        style={[
          outerStyle,
          {
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: BRAND.blue,
          },
        ]}
      >
        {InnerContent}
      </TouchableOpacity>
    );
  }

  if (variant === "danger") {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={isInert ? 1 : 0.85}
        onPress={isInert ? undefined : onPress}
        disabled={isInert}
        style={[outerStyle, { backgroundColor: BRAND.coral }]}
      >
        {InnerContent}
      </TouchableOpacity>
    );
  }

  // tertiary — text only
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={isInert ? 1 : 0.65}
      onPress={isInert ? undefined : onPress}
      disabled={isInert}
      style={[outerStyle, { backgroundColor: "transparent" }]}
    >
      {InnerContent}
    </TouchableOpacity>
  );
}

function textColor(v: Variant): string {
  switch (v) {
    case "primary":
    case "rainbow":
    case "danger":
      return "#FFFFFF";
    case "secondary":
      return BRAND.blue;
    default:
      return TEXT.primary;
  }
}

function iconColor(v: Variant): string {
  return textColor(v);
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
