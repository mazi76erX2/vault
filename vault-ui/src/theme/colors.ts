/**
 * Color scheme configuration
 * Light and Dark modes with custom palette
 */

export const lightTheme = {
  // Background
  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceAlt: "#F3F4F6",

  // Primary (Vault Orange)
  primary: "#E66334",
  primaryLight: "#F08A68",
  primaryDark: "#BF4E28",

  // Accent colors
  accent1: "#81334B", // Rose
  accent2: "#10B981", // Emerald
  accent3: "#F59E0B", // Amber

  // Text
  text: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Status
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

export const darkTheme = {
  // Background
  background: "#09090B",
  surface: "#18181B",
  surfaceAlt: "#27272A",

  // Primary (Vault Orange)
  primary: "#E66334",
  primaryLight: "#F08A68",
  primaryDark: "#BF4E28",

  // Accent colors
  accent1: "#FB7185",
  accent2: "#34D399",
  accent3: "#FBBF24",

  // Text
  text: "#FAFAFA",
  textSecondary: "#D4D4D8",
  textMuted: "#71717A",

  // Borders
  border: "#27272A",
  borderLight: "#3F3F46",

  // Status
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

export type Theme = typeof lightTheme;
