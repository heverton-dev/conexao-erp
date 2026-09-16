import { supabase } from "~/core/supabase";
import type { MetaCampanha, MetaCampanhaInsight } from "../types";

export async function listarCampanhas(
  empresaId: string,
): Promise<MetaCampanha[]> {
  const { data } = await supabase
    .from("mktg_meta_campanhas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  return (data as MetaCampanha[]) ?? [];
}

export async function buscarInsights(
  campanhaId: string,
): Promise<MetaCampanhaInsight | null> {
  const { data } = await supabase
    .from("mktg_meta_insights")
    .select("*")
    .eq("campanha_id", campanhaId)
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as MetaCampanhaInsight | null;
}
