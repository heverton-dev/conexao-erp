import { useContext } from "react";
import {
  DesignSystemContext,
  ModuleDesignContext,
} from "../provider/DesignSystemContext";
import type { DesignTokens } from "../tokens/types";

/** Hook principal: acessa tokens globais resolvidos */
export function useDesignSystem() {
  return useContext(DesignSystemContext);
}

/** Hook para tokens do módulo atual */
export function useModuleDesign() {
  return useContext(ModuleDesignContext);
}

/** Hook para acessar um token específico por path */
export function useDesignToken<T = string>(path: string, fallback?: T): T {
  const { tokens } = useContext(DesignSystemContext);
  const keys = path.split(".");
  let value: unknown = tokens;
  for (const key of keys) {
    if (value == null || typeof value !== "object") return fallback as T;
    value = (value as Record<string, unknown>)[key];
  }
  return (value ?? fallback) as T;
}

/** Hook para editar tokens (admin) */
export function useDesignEditor() {
  const ctx = useContext(DesignSystemContext);
  return {
    tokens: ctx.tokens,
    presetKey: ctx.presetKey,
    isLoading: ctx.isLoading,
  };
}
