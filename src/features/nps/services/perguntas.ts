import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { NpsPergunta } from "../types";

const MODULO_KEY = "nps";

export async function listarPerguntas(
  empresaId: string,
): Promise<NpsPergunta[]> {
  const { data, error } = await supabase
    .from("nps_perguntas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data as NpsPergunta[]) || [];
}

export async function listarPerguntasAtivas(
  empresaId: string,
): Promise<NpsPergunta[]> {
  const { data, error } = await supabase
    .from("nps_perguntas")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("active", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data as NpsPergunta[]) || [];
}

export async function criarPergunta(
  empresaId: string,
  pergunta: Omit<
    NpsPergunta,
    "id" | "empresa_id" | "created_at" | "updated_at"
  >,
): Promise<NpsPergunta> {
  const { data, error } = await supabase
    .from("nps_perguntas")
    .insert({ ...pergunta, empresa_id: empresaId })
    .select()
    .single();

  if (error) throw error;

  dispararEventoModulo(MODULO_KEY, "nps.pergunta_criada", {
    pergunta_id: data.id,
    empresa_id: empresaId,
  }).catch(() => {});

  return data as NpsPergunta;
}

export async function atualizarPergunta(
  id: string,
  pergunta: Partial<NpsPergunta>,
): Promise<NpsPergunta> {
  const { data, error } = await supabase
    .from("nps_perguntas")
    .update({ ...pergunta, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as NpsPergunta;
}

export async function excluirPergunta(id: string): Promise<void> {
  const { error } = await supabase.from("nps_perguntas").delete().eq("id", id);

  if (error) throw error;
}

export async function toggleAtiva(id: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from("nps_perguntas")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function reordenar(id: string, orderIndex: number): Promise<void> {
  const { error } = await supabase
    .from("nps_perguntas")
    .update({ order_index: orderIndex, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
