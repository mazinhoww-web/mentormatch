export const T = {
  bgDeep: "#08080d",
  bgBase: "#0d0d14",
  bgElevated: "#13131e",
  surface: "rgba(255,255,255,0.04)",
  glass: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.07)",
  borderAccent: "rgba(99,102,241,0.35)",
  accent: "#4F46E5",
  accentAlt: "#6366F1",
  accentGlow: "rgba(79,70,229,0.28)",
  green: "#10B981",
  greenGlow: "rgba(16,185,129,0.2)",
  text: "#EDEDEF",
  textMuted: "#6B7280",
  textSub: "#9CA3AF",
  radius: "14px",
  radiusSm: "8px",
} as const

export type DesignToken = typeof T
