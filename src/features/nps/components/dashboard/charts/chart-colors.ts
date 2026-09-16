/**
 * Cores do design system para uso em Recharts (SVG).
 * Recharts não suporta CSS variables em atributos SVG,
 * então usamos hex values diretamente.
 */

export const COLORS = {
  // Design system tokens
  accent: "#c9a655",
  accentLight: "#d4b366",
  accentDark: "#a8873a",
  surface: "#1e293b",
  surfaceHover: "#334155",
  border: "#334155",
  borderLight: "#475569",
  textMain: "#f8fafc",
  textMuted: "#94a3b8",
  textSecondary: "#cbd5e1",
  bg: "#0f172a",

  // Semantic colors
  success: "#22c55e",
  successLight: "#4ade80",
  warning: "#eab308",
  warningLight: "#facc15",
  error: "#ef4444",
  errorLight: "#f87171",
  info: "#3b82f6",
  infoLight: "#60a5fa",
  purple: "#a78bfa",
  cyan: "#06b6d4",
} as const;

export const TOOLTIP_STYLE = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  color: COLORS.textMain,
  padding: "8px 12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  fontSize: 12,
} as const;

export const GRID_STYLE = {
  stroke: COLORS.border,
  strokeOpacity: 0.5,
} as const;

export const AXIS_STYLE = {
  stroke: COLORS.textMuted,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

/** Cor da barra/linha baseada no score NPS */
export const npsColor = (score: number) =>
  score >= 50 ? COLORS.success : score >= 0 ? COLORS.warning : COLORS.error;

/** Cor de fundo baseada no score NPS */
export const npsBg = (score: number) =>
  score >= 50 ? "rgba(34,197,94,0.15)" : score >= 0 ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)";
