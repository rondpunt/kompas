import React, { createContext, useContext, useState, useCallback } from "react";
import { PALETTE, PALETTE_DARK } from "@/src/theme/tokens";

type ThemePalette = typeof PALETTE;

interface ThemeContextValue {
  palette: ThemePalette;
  colorScheme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  palette: PALETTE,
  colorScheme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  const toggleTheme = useCallback(() => {
    setColorScheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const palette = colorScheme === "dark" ? (PALETTE_DARK as unknown as ThemePalette) : PALETTE;

  return (
    <ThemeContext.Provider value={{ palette, colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
