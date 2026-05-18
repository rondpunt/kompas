import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { APP_NAME } from "@/src/config/branding";

interface Props {
  size?: number; // base font size
  testID?: string;
}

export function Wordmark({ size = 15, testID }: Props) {
  const { palette } = useTheme();
  const dotSize = 5;
  return (
    <View style={styles.row} testID={testID ?? "wordmark"}>
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: palette.textPrimary,
          marginRight: 3,
          marginBottom: 1,
        }}
      />
      <Text
        style={{
          fontSize: size,
          color: palette.textPrimary,
          fontWeight: "500",
          letterSpacing: -0.3,
        }}
      >
        {APP_NAME}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});
