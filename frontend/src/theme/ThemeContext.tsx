import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useColorScheme } from "react-native";
import { storage } from "@/src/utils/storage";
import { NIGHT, KLAAR, Palette, ThemeName } from "./colors";

type ThemeMode = "night" | "klaar" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  theme: ThemeName;
  palette: Palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "kompas.theme.mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("night");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(STORAGE_KEY, "night");
      if (saved === "night" || saved === "klaar" || saved === "system") {
        setModeState(saved);
      }
      setLoaded(true);
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    storage.setItem(STORAGE_KEY, m);
  };

  const theme: ThemeName = useMemo(() => {
    if (mode === "system") return system === "light" ? "klaar" : "night";
    return mode;
  }, [mode, system]);

  const palette = theme === "night" ? NIGHT : KLAAR;

  const value = useMemo(() => ({ mode, setMode, theme, palette }), [mode, theme, palette]);

  if (!loaded) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
