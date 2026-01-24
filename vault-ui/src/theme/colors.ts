/**
 * Color scheme configuration
 * Light and Dark modes with custom palette
 */

export const lightTheme = {
  // Background
  background: "#ffffff",
  surface: "#f0f0f0",
  surfaceAlt: "#f8f8f8",

  // Primary
  primary: "#6061c0",
  primaryLight: "#50a0e0",
  primaryDark: "#504090",

  // Accent colors
  accent1: "#81334b",
  accent2: "#6ea861",
  accent3: "#ee9e6e",

  // Text
  text: "#000000",
  textSecondary: "#666666",
  textMuted: "#a0a0a0",

  // Borders
  border: "#e0e0e0",
  borderLight: "#f0f0f0",

  // Status
  success: "#6ea861",
  warning: "#ee9e6e",
  error: "#81334b",
  info: "#50a0e0",
};

export const darkTheme = {
  // Background
  background: "#0f0f0f",
  surface: "#1a1a2e",
  surfaceAlt: "#16213e",

  // Primary (using dark theme palette)
  primary: "#55BBAD",
  primaryLight: "#DD5794",
  primaryDark: "#6C4572",

  // Accent colors
  accent1: "#DD5794",
  accent2: "#55BBAD",
  accent3: "#DBC1CA",

  // Text
  text: "#ffffff",
  textSecondary: "#e0e0e0",
  textMuted: "#a0a0a0",

  // Borders
  border: "#333333",
  borderLight: "#2a2a2a",

  // Status
  success: "#55BBAD",
  warning: "#DD5794",
  error: "#DD5794",
  info: "#55BBAD",
};

export type Theme = typeof lightTheme;
