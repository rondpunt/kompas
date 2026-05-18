import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Platform,
  GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import {
  BRAND,
  BORDER,
  LAYERS,
  RADII,
  TEXT,
  RAINBOW_GRADIENT,
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

const HEIGHT_MAP: Record<Size, number> = { sm: 36, md: 48, lg: 54 };
const PAD_X_MAP: Record<Size, number> = { sm: 14, md: 20, lg: 24 };
const FS_MAP: Record<Size, number> = { sm: 13, md: 15, lg: 16 };

/**
 * Premium button met inner-highlight + 2-layer shadow + gradient.
 * Volg vier states: rust → hover → active → disabled (mobiel = touch, active via opacity).
 */
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
  const radius = size === "sm" ? RADII.sm : RADII.md;

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

  // Outer wrapping
  const outerStyle: StyleProp<ViewStyle> = [
    {
      height,
      borderRadius: radius,
      overflow: "hidden",
      opacity: disabled ? 0.4 : 1,
    },
    fullWidth ? { alignSelf: "stretch" } : null,
    variant === "primary" ? glowBlue("soft") : null,
    variant === "rainbow" ? glowBlue("strong") : null,
    variant === "secondary" || variant === "tertiary" ? null : shadow("xs"),
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
          style={[StyleSheet.absoluteFillObject]}
        />
        {/* inner-highlight bovenaan */}
        <View pointerEvents="none" style={styles.innerHighlight} />
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
          colors={RAINBOW_GRADIENT as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject]}
        />
        <View pointerEvents="none" style={styles.innerHighlight} />
        {InnerContent}
      </TouchableOpacity>
    );
  }

  if (variant === "secondary") {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={isInert ? 1 : 0.7}
        onPress={isInert ? undefined : onPress}
        disabled={isInert}
        style={[
          outerStyle,
          {
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: BORDER.default,
          },
        ]}
      >
        <View pointerEvents="none" style={styles.innerHighlightSubtle} />
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
        style={[
          outerStyle,
          { backgroundColor: BRAND.red },
        ]}
      >
        <View pointerEvents="none" style={styles.innerHighlight} />
        {InnerContent}
      </TouchableOpacity>
    );
  }

  // tertiary
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
      return "#ffffff";
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
  innerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  innerHighlightSubtle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: BORDER.topHighlight,
  },
});
