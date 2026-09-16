import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { MktgLead } from "../types";

const MODULO_KEY = "mktg-leads";

export async function listarLeads(empresaId: string): Promise<MktgLead[]> {
  const { data } = await supabase
    .from("mktg_leads")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });
  return (data as MktgLead[]) || [];
}

export async function buscarLead(id: string, empresaId: string): Promise<MktgLead | null> {
  const { data } = await supabase
    .from("mktg_leads")
    .select("*")
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();
  return (data as MktgLead) || null;
}

export async function criarLead(input: {
  empresa_id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  origem?: string | null;
  status?: string;
  score?: number;
}): Promise<MktgLead> {
  const { data, error } = await supabase
    .from("mktg_leads")
    .insert({
      empresa_id: input.empresa_id,
      nome: input.nome,
      email: input.email || null,
      telefone: input.telefone || null,
      origem: input.origem || null,
      status: input.status || "novo",
      score: input.score ?? 10,
    })
    .select()
    .single();
  if (error) throw error;
  dispararEventoModulo(MODULO_KEY, "lead.capturado", { lead_id: data.id, nome: input.nome, empresa_id: input.empresa_id }).catch(() => {});
  return data as MktgLead;
}

export async function atualizarLead(
  id: string,
  updates: Partial<MktgLead>,
  empresaId: string
): Promise<MktgLead> {
  const { data, error } = await supabase
    .from("mktg_leads")
    .update(updates)
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .select()
    .single();
  if (error) throw error;
  return data as MktgLead;
}

export async function deletarLead(id: string): Promise<void> {
  await supabase.from("mktg_leads").delete().eq("id", id);
}
