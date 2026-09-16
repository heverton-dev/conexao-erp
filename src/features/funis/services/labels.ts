import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Label, LabelInput } from "../types";

const MODULO_KEY = "funis";

export async function listarLabels(funilId: string): Promise<Label[]> {
  const { data, error } = await supabase
    .from("funis_etiquetas")
    .select("*")
    .eq("funil_id", funilId)
    .order("nome");
  if (error) throw error;
  return (data ?? []) as Label[];
}

export async function criarLabel(input: LabelInput): Promise<Label> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: funil } = await supabase
    .from("funis")
    .select("empresa_id")
    .eq("id", input.funil_id)
    .single();

  const { data, error } = await supabase
    .from("funis_etiquetas")
    .insert({
      funil_id: input.funil_id,
      nome: input.nome,
      cor: input.cor ?? "#6366f1",
      empresa_id: funil?.empresa_id ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Label;
}

export async function atualizarLabel(
  id: string,
  input: Partial<LabelInput>,
): Promise<Label> {
  const { data, error } = await supabase
    .from("funis_etiquetas")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Label;
}

export async function deletarLabel(id: string): Promise<void> {
  const { error } = await supabase.from("funis_etiquetas").delete().eq("id", id);
  if (error) throw error;
}

export async function adicionarLabelTarefa(
  tarefaId: string,
  labelId: string,
): Promise<void> {
  const { error } = await supabase
    .from("funis_etiquetas_tarefa")
    .insert({ tarefa_id: tarefaId, label_id: labelId });
  if (error) throw error;

  // Buscar dados da label para incluir no evento
  const { data: label } = await supabase
    .from("funis_etiquetas")
    .select("nome, cor, empresa_id")
    .eq("id", labelId)
    .single();

  dispararEventoModulo(MODULO_KEY, "tarefa.label_adicionado", {
    tarefa_id: tarefaId,
    label_id: labelId,
    label_nome: label?.nome,
    label_cor: label?.cor,
  }).catch(() => {});
}

export async function removerLabelTarefa(
  tarefaId: string,
  labelId: string,
): Promise<void> {
  const { error } = await supabase
    .from("funis_etiquetas_tarefa")
    .delete()
    .eq("tarefa_id", tarefaId)
    .eq("label_id", labelId);
  if (error) throw error;
}

export async function listarLabelsTarefa(tarefaId: string): Promise<Label[]> {
  const { data, error } = await supabase
    .from("funis_etiquetas_tarefa")
    .select("label:funis_labels(*)")
    .eq("tarefa_id", tarefaId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.label).filter(Boolean) as Label[];
}
