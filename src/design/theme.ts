// Design System Theme Tokens
// Centralized token definitions for colors, spacing, border radius, and typography.
// These tokens are referenced by Tailwind config and UI components.

export const theme = {
  // Semantic color palette – map to Tailwind’s color classes.
  colors: {
    primary: "emerald", // used for primary actions
    secondary: "stone",
    accent: "amber",
    danger: "red",
    success: "green",
    warning: "yellow",
    background: {
      light: "#f9fafb",
      dark: "#0f1316",
    },
    surface: {
      light: "#ffffff",
      dark: "#111827",
    },
  },

  // Spacing scale – multiples of 4px (Tailwind base).
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
  },

  // Border‑radius values.
  radius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.25rem",  // 4px
    lg: "0.5rem",   // 8px
    xl: "0.75rem",  // 12px
    full: "9999px",
  },

  // Typography – font families used across the app.
  fonts: {
    display: "'Outfit', system-ui, sans-serif",
    sans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
};
