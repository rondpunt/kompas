import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { ThemeProvider } from "@/src/theme/ThemeContext";
import { AuthProvider } from "@/src/auth/AuthContext";
import { LAYERS } from "@/src/theme/tokens";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: LAYERS.canvas }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <View style={{ flex: 1, backgroundColor: LAYERS.canvas }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                  contentStyle: { backgroundColor: LAYERS.canvas },
                }}
              />
            </View>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
