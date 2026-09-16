import { type ReactNode, useEffect, useMemo } from "react";
import { useAuth } from "~/lib/auth";
import { DesignSystemContext } from "./DesignSystemContext";
import {
  useDesignGlobalQuery,
  useDesignEmpresaQuery,
} from "../services/design-system.queries";
import { resolveTokens } from "../tokens/resolver";
import { tokensToCssVars } from "../tokens/css-var-map";
import type { PresetKey } from "../tokens/types";

/**
 * DesignSystemProvider — substitui ThemeProvider
 * Injeta todas as CSS vars do design system no :root
 * Carrega configs do Supabase via React Query (stale-while-revalidate)
 */
export function DesignSystemProvider({ children }: { children: ReactNode }) {
  const { empresa } = useAuth();
  const empresaId = empresa?.id;

  const { data: global, isLoading: loadingGlobal } = useDesignGlobalQuery();
  const { data: emp, isLoading: loadingEmp } = useDesignEmpresaQuery(empresaId);

  const isLoading = loadingGlobal || (!!empresaId && loadingEmp);

  const tokens = useMemo(
    () =>
      resolveTokens({
        presetKey: (emp?.preset_key ??
          global?.preset_key ??
          "dark-gold") as PresetKey,
        globalOverride: global?.tokens_override ?? null,
        empresaOverride: emp?.tokens_override ?? null,
      }),
    [global, emp],
  );

  // Injeta CSS vars no :root
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = tokensToCssVars(tokens);
    for (const [varName, value] of Object.entries(cssVars)) {
      root.style.setProperty(varName, value);
    }
    // Injeta font-family no body
    document.body.style.fontFamily = tokens.typography.fontFamily;
  }, [tokens]);

  // Favicon da empresa (mantém comportamento atual)
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

  const presetKey = (emp?.preset_key ??
    global?.preset_key ??
    "dark-gold") as PresetKey;

  return (
    <DesignSystemContext.Provider value={{ tokens, presetKey, isLoading }}>
      {children}
    </DesignSystemContext.Provider>
  );
}
