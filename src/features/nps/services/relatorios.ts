import { supabase } from "~/core/supabase";
import { EMPRESA_ID } from "~/config/empresa"
import type { NpsRelatorioEnvio } from "../types";

export async function listarRelatorios(
  dateFrom?: string,
  dateTo?: string,
): Promise<NpsRelatorioEnvio[]> {
  let query = supabase
    .from("nps_relatorios_envio")
    .select("*")
    .order("data_envio", { ascending: false })
    .order("created_at", { ascending: false });

  if (dateFrom) query = query.gte("data_envio", dateFrom);
  if (dateTo) query = query.lte("data_envio", dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return (data as NpsRelatorioEnvio[]) || [];
}
