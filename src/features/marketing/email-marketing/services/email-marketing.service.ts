import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { CampanhaEmail } from "../types";

const MODULO_KEY = "mktg-email";

export async function listarCampanhas(empresaId: string): Promise<CampanhaEmail[]> {
  const { data } = await supabase
    .from("mktg_campanhas_email")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });
  return (data as CampanhaEmail[]) || [];
}

export async function criarCampanha(input: {
  empresa_id: string;
  nome: string;
  assunto: string;
  remetente: string;
  status?: string;
}): Promise<CampanhaEmail> {
  const { data, error } = await supabase
    .from("mktg_campanhas_email")
    .insert({
      empresa_id: input.empresa_id,
      nome: input.nome,
      assunto: input.assunto,
      remetente: input.remetente || "contato@empresa.com.br",
      status: input.status || "rascunho",
      total_enviados: 0,
      total_abertos: 0,
      total_cliques: 0,
    })
    .select()
    .single();
  if (error) throw error;
  dispararEventoModulo(MODULO_KEY, "campanha.criada", { campanha_id: data.id, nome: input.nome, empresa_id: input.empresa_id }).catch(() => {});
  return data as CampanhaEmail;
}

export async function deletarCampanha(id: string): Promise<void> {
  await supabase.from("mktg_campanhas_email").delete().eq("id", id);
}
