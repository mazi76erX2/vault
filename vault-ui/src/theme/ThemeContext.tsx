import React, { createContext, useContext, useEffect, useState } from "react";
import { lightTheme, darkTheme, type Theme } from "./colors";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  colors: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage
    const stored = localStorage.getItem("theme-mode");
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const colors = mode === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    // Save preference
    localStorage.setItem("theme-mode", mode);

    // Apply to document
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [mode, colors]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
