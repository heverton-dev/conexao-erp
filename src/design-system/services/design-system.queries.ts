import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import {
  getDesignGlobal,
  getDesignEmpresa,
  getDesignModulo,
} from "./design-system.service";
import type { PresetKey } from "../tokens/types";
import { resolveTokens } from "../tokens/resolver";
import type { DesignTokens } from "../tokens/types";

export function useDesignGlobalQuery() {
  return useQuery({
    queryKey: ["design-system-global"],
    queryFn: getDesignGlobal,
    staleTime: 5 * 60 * 1000, // 5min
  });
}

export function useDesignEmpresaQuery(empresaId: string | undefined) {
  return useQuery({
    queryKey: ["design-system-empresa", empresaId],
    queryFn: () => getDesignEmpresa(empresaId!),
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDesignModuloQuery(
  empresaId: string | undefined,
  moduloKey: string,
) {
  return useQuery({
    queryKey: ["design-system-modulo", empresaId, moduloKey],
    queryFn: () => getDesignModulo(empresaId!, moduloKey),
    enabled: !!empresaId && !!moduloKey,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook principal: resolve tokens completos para o contexto atual
 */
export function useResolvedTokens(moduloKey?: string): DesignTokens {
  const { empresa } = useAuth();
  const empresaId = empresa?.id;

  const { data: global } = useDesignGlobalQuery();
  const { data: emp } = useDesignEmpresaQuery(empresaId);
  const { data: mod } = useDesignModuloQuery(empresaId, moduloKey ?? "");

  return resolveTokens({
    presetKey: (emp?.preset_key ??
      global?.preset_key ??
      "dark-gold") as PresetKey,
    globalOverride: global?.tokens_override ?? null,
    empresaOverride: emp?.tokens_override ?? null,
    moduloOverride: moduloKey ? (mod?.tokens_override ?? null) : null,
  });
}
