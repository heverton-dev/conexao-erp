import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Criativo } from "../types";

const MODULO_KEY = "mktg-criativos";

export async function listarCriativos(empresaId: string): Promise<Criativo[]> {
  const { data } = await supabase
    .from("mktg_criativos")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });
  return (data as Criativo[]) || [];
}

export async function criarCriativo(input: {
  empresa_id: string;
  nome: string;
  tipo: string;
  descricao?: string | null;
  status?: string;
}): Promise<Criativo> {
  const { data, error } = await supabase
    .from("mktg_criativos")
    .insert({
      empresa_id: input.empresa_id,
      nome: input.nome,
      tipo: input.tipo,
      descricao: input.descricao || null,
      status: input.status || "rascunho",
    })
    .select()
    .single();
  if (error) throw error;
  dispararEventoModulo(MODULO_KEY, "criativo.criado", { criativo_id: data.id, nome: input.nome, empresa_id: input.empresa_id }).catch(() => {});
  return data as Criativo;
}

export async function deletarCriativo(id: string): Promise<void> {
  await supabase.from("mktg_criativos").delete().eq("id", id);
}
