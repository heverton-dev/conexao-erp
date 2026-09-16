import { supabase } from "~/core/supabase";
import type { RotasConfig } from "../types";

export async function getConfig(
  empresaId: string,
): Promise<RotasConfig | null> {
  const { data, error } = await supabase
    .from("rotas_config")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (error) throw error;
  return data as RotasConfig | null;
}

export async function upsertConfig(
  empresaId: string,
  config: Partial<RotasConfig>,
): Promise<RotasConfig> {
  const { data, error } = await supabase
    .from("rotas_config")
    .upsert({ empresa_id: empresaId, ...config }, { onConflict: "empresa_id" })
    .select()
    .single();
  if (error) throw error;
  return data as RotasConfig;
}
