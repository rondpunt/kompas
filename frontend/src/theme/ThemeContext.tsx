import React, { createContext, useContext, useMemo } from "react";
import { NIGHT, Palette } from "./colors";

// Junie v3: alleen dark mode. We keep the provider for API compatibility,
// but mode is locked to "night" — geen lichte variant.
type ThemeMode = "night";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  theme: ThemeMode;
  palette: Palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: "night",
      setMode: () => {},
      theme: "night",
      palette: NIGHT,
    }),
    [],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
