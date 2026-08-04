// Mori Mobile - Tema oficial
export const colors = {
  gold: "#c5a84a",
  goldDeep: "#9b8038",
  goldSoft: "#e8d99f",
  black: "#0f0f11",
  black2: "#1a1815",
  white: "#ffffff",
  ivory: "#faf8f3",
  paper: "#f8f6f0",
  text: "#1a1815",
  muted: "#8a826a",
  line: "#e8e2d4",
  success: "#10b981",
  danger: "#ef4444",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const typography = {
  serif: {
    fontFamily: "serif",
  },
  sans: {
    fontFamily: "System",
  },
  h1: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.5 },
  body: { fontSize: 15, fontWeight: "400" as const },
  small: { fontSize: 12, fontWeight: "500" as const },
  tiny: { fontSize: 10, fontWeight: "600" as const },
};
