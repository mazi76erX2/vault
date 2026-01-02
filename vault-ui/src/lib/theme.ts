export const lightTheme = {
  colors: {
    // Primary colors
    background: "#f0f0f0",
    primary: "#6061c0",
    secondary: "#50a0e0",
    tertiary: "#504090",

    // Accent colors
    muted: "#a0a0a0",
    accent: "#81334b",
    success: "#6ea861",
    warning: "#ee9e6e",

    // Text colors
    foreground: "#1a1a1a",
    mutedForeground: "#6b6b6b",

    // UI elements
    border: "#d0d0d0",
    input: "#ffffff",
    ring: "#6061c0",

    // Card
    card: "#ffffff",
    cardForeground: "#1a1a1a",

    // Popover
    popover: "#ffffff",
    popoverForeground: "#1a1a1a",

    // Destructive
    destructive: "#81334b",
    destructiveForeground: "#ffffff",
  },
};

export const darkTheme = {
  colors: {
    // Primary colors
    background: "#29254A",
    primary: "#55BBAD",
    secondary: "#DD5794",
    tertiary: "#6C4572",

    // Accent colors
    muted: "#DBC1CA",
    accent: "#DD5794",
    success: "#55BBAD",
    warning: "#ee9e6e",

    // Text colors
    foreground: "#DBC1CA",
    mutedForeground: "#a89caa",

    // UI elements
    border: "#6C4572",
    input: "#3a3565",
    ring: "#55BBAD",

    // Card
    card: "#3a3565",
    cardForeground: "#DBC1CA",

    // Popover
    popover: "#3a3565",
    popoverForeground: "#DBC1CA",

    // Destructive
    destructive: "#DD5794",
    destructiveForeground: "#ffffff",
  },
};

export type Theme = typeof lightTheme;
