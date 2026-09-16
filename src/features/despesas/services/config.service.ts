import { supabase } from "~/core/supabase";
import type { DespesaConfig } from "../types";

export async function buscarConfig(
): Promise<DespesaConfig | null> {
  const { data, error } = await supabase
    .from("despesas_config")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as DespesaConfig | null;
}

export async function criarOuAtualizarConfig(
  config: Partial<DespesaConfig>,
): Promise<DespesaConfig> {
  const existente = await buscarConfig();

  if (existente) {
    const { data, error } = await supabase
      .from("despesas_config")
      .update(config)
      .select()
      .single();
    if (error) throw error;
    return data as DespesaConfig;
  }

  const { data, error } = await supabase
    .from("despesas_config")
    .insert({ ...config })
    .select()
    .single();
  if (error) throw error;
  return data as DespesaConfig;
}
