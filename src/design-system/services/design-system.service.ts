import { supabase } from "~/core/supabase";
import type { DesignTokens, PresetKey } from "../tokens/types";

export interface DesignSystemGlobal {
  id: string;
  preset_key: PresetKey | null;
  tokens_override: Partial<DesignTokens>;
  versao: string;
  updated_at: string;
}

export interface DesignSystemEmpresa {
  id: string;
  empresa_id: string;
  preset_key: PresetKey | null;
  tokens_override: Partial<DesignTokens>;
  versao: string;
  updated_at: string;
}

export interface DesignSystemModulo {
  id: string;
  empresa_id: string;
  modulo_key: string;
  tokens_override: Partial<DesignTokens>;
  versao: string;
  updated_at: string;
}

// ── Global ──

export async function getDesignGlobal(): Promise<DesignSystemGlobal | null> {
  const { data, error } = await supabase
    .from("design_sistema_global")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDesignGlobal(payload: {
  preset_key?: PresetKey | null;
  tokens_override?: Partial<DesignTokens>;
  versao?: string;
}): Promise<void> {
  const { error } = await supabase.from("design_sistema_global").upsert(
    {
      preset_key: payload.preset_key ?? null,
      tokens_override: payload.tokens_override ?? {},
      versao: payload.versao ?? "1.0.0",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id", ignoreDuplicates: false },
  );
  if (error) throw error;
}

// ── Empresa ──

export async function getDesignEmpresa(
  empresaId: string,
): Promise<DesignSystemEmpresa | null> {
  const { data, error } = await supabase
    .from("empresa_design_system")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDesignEmpresa(payload: {
  empresa_id: string;
  preset_key?: PresetKey | null;
  tokens_override?: Partial<DesignTokens>;
  versao?: string;
}): Promise<void> {
  const { error } = await supabase.from("empresa_design_system").upsert(
    {
      empresa_id: payload.empresa_id,
      preset_key: payload.preset_key ?? null,
      tokens_override: payload.tokens_override ?? {},
      versao: payload.versao ?? "1.0.0",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "empresa_id" },
  );
  if (error) throw error;
}

// ── Módulo ──

export async function getDesignModulo(
  empresaId: string,
  moduloKey: string,
): Promise<DesignSystemModulo | null> {
  const { data, error } = await supabase
    .from("design_sistema_modulo")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("modulo_key", moduloKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDesignModulo(payload: {
  empresa_id: string;
  modulo_key: string;
  tokens_override?: Partial<DesignTokens>;
  versao?: string;
}): Promise<void> {
  const { error } = await supabase.from("design_sistema_modulo").upsert(
    {
      empresa_id: payload.empresa_id,
      modulo_key: payload.modulo_key,
      tokens_override: payload.tokens_override ?? {},
      versao: payload.versao ?? "1.0.0",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "empresa_id,modulo_key" },
  );
  if (error) throw error;
}
