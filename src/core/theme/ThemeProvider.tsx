import { type ReactNode, useEffect } from "react";
import { useAuth } from "~/lib/auth";

const DEFAULT_THEME = {
  accent: "#c9a655",
  accent_hover: "#d4b366",
  gradient_start: "#c9a655",
  gradient_mid: "#e8d48b",
  gradient_end: "#a8873a",
  bg: "#0f172a",
  surface: "#1e293b",
  text_main: "#f8fafc",
  text_muted: "#94a3b8",
  success: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
  nps_bg: "#09090b",
  nps_surface: "#18181b",
  nps_text: "#fafafa",
  nps_text_muted: "#71717a",
};

const THEME_KEYS: Record<string, string> = {
  accent: "--color-accent",
  accent_hover: "--color-accent-hover",
  gradient_start: "--color-gradient-start",
  gradient_mid: "--color-gradient-mid",
  gradient_end: "--color-gradient-end",
  bg: "--color-bg",
  surface: "--color-surface",
  text_main: "--color-text-main",
  text_muted: "--color-text-muted",
  success: "--color-success",
  warning: "--color-warning",
  error: "--color-error",
  nps_bg: "--nps-bg",
  nps_surface: "--nps-surface",
  nps_text: "--nps-text",
  nps_text_muted: "--nps-text-muted",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { empresa } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    const theme: Record<string, string> = empresa?.theme ?? DEFAULT_THEME;

    for (const [key, cssVar] of Object.entries(THEME_KEYS)) {
      const value =
        theme[key] || DEFAULT_THEME[key as keyof typeof DEFAULT_THEME];
      root.style.setProperty(cssVar, value);
    }
  }, [empresa]);

  useEffect(() => {
    const favicon = empresa?.favicon_url;
    if (favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [empresa?.favicon_url]);

  return <>{children}</>;
}
