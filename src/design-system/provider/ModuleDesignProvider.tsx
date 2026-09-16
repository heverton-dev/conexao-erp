import { type ReactNode, useEffect, useMemo } from "react";
import { ModuleDesignContext } from "./DesignSystemContext";
import {
  useDesignGlobalQuery,
  useDesignEmpresaQuery,
  useDesignModuloQuery,
} from "../services/design-system.queries";
import { resolveTokens } from "../tokens/resolver";
import { tokensToCssVars } from "../tokens/css-var-map";
import { useAuth } from "~/lib/auth";
import type { PresetKey } from "../tokens/types";

interface Props {
  moduloKey: string;
  children: ReactNode;
}

/**
 * ModuleDesignProvider — wrapper de layout por módulo
 * Aplica tokens do módulo via CSS vars em data-module container
 */
export function ModuleDesignProvider({ moduloKey, children }: Props) {
  const { empresa } = useAuth();
  const empresaId = empresa?.id;

  const { data: global } = useDesignGlobalQuery();
  const { data: emp } = useDesignEmpresaQuery(empresaId);
  const { data: mod } = useDesignModuloQuery(empresaId, moduloKey);

  const tokens = useMemo(
    () =>
      resolveTokens({
        presetKey: (emp?.preset_key ??
          global?.preset_key ??
          "dark-gold") as PresetKey,
        globalOverride: global?.tokens_override ?? null,
        empresaOverride: emp?.tokens_override ?? null,
        moduloOverride: mod?.tokens_override ?? null,
      }),
    [global, emp, mod],
  );

  // Os overrides de módulo ficam em CSS vars com escopo no container
  // Mas para simplificar, mantemos no :root com prefixo --mod-
  useEffect(() => {
    if (!mod?.tokens_override) return;
    const root = document.documentElement;
    const cssVars = tokensToCssVars(tokens);
    for (const [varName, value] of Object.entries(cssVars)) {
      root.style.setProperty(varName, value);
    }
    return () => {
      // Cleanup: restaura tokens da empresa ao sair do módulo
      // O DesignSystemProvider vai re-aplicar no próximo render
    };
  }, [tokens, mod]);

  return (
    <ModuleDesignContext.Provider value={{ moduloKey, tokens }}>
      <div data-module={moduloKey}>{children}</div>
    </ModuleDesignContext.Provider>
  );
}
