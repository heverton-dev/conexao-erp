import { supabase } from "~/core/supabase";
import type { RotasFormPergunta, FormPerguntaTipo } from "../types";

export async function listarPerguntas(
  empresaId: string,
): Promise<RotasFormPergunta[]> {
  const { data, error } = await supabase
    .from("rotas_form_perguntas")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .order("ordem");
  if (error) throw error;
  return (data ?? []) as RotasFormPergunta[];
}

export async function criarPergunta(
  pergunta: Omit<RotasFormPergunta, "id" | "created_at" | "updated_at">,
): Promise<RotasFormPergunta> {
  const { data, error } = await supabase
    .from("rotas_form_perguntas")
    .insert(pergunta)
    .select()
    .single();
  if (error) throw error;
  return data as RotasFormPergunta;
}

export async function atualizarPergunta(
  id: string,
  updates: Partial<RotasFormPergunta>,
): Promise<RotasFormPergunta> {
  const { data, error } = await supabase
    .from("rotas_form_perguntas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as RotasFormPergunta;
}

export async function excluirPergunta(id: string): Promise<void> {
  const { error } = await supabase
    .from("rotas_form_perguntas")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reordenarPerguntas(
  atualizacoes: { id: string; ordem: number }[],
): Promise<void> {
  await Promise.all(
    atualizacoes.map(({ id, ordem }) =>
      supabase.from("rotas_form_perguntas").update({ ordem }).eq("id", id),
    ),
  );
}

export async function togglePergunta(
  id: string,
  ativo: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("rotas_form_perguntas")
    .update({ ativo })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
}
