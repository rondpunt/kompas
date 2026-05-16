import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { AuthProvider } from "@/src/auth/AuthContext";

function StatusBarThemed() {
  const { theme } = useTheme();
  return <StatusBar style={theme === "night" ? "light" : "dark"} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBarThemed />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "transparent" },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
