import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { FunilTarefa, FunilTarefaInput } from "../types";

const MODULO_KEY = "funis";

export async function criarTarefa(
  input: FunilTarefaInput,
): Promise<FunilTarefa> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: maxPos } = await supabase
    .from("funis_tarefas")
    .select("posicao")
    .eq("coluna_id", input.coluna_id)
    .order("posicao", { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from("funis_tarefas")
    .insert({
      funil_id: input.funil_id,
      coluna_id: input.coluna_id,
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      posicao: (maxPos?.posicao ?? -1) + 1,
      prioridade: input.prioridade ?? "medium",
      atribuido_para: input.atribuido_para ?? null,
      tools: input.tools ?? [],
      data_inicio: input.data_inicio ?? null,
      data_fim: input.data_fim ?? null,
      depende_tarefa_id: input.depende_tarefa_id ?? null,
      parent_task_id: input.parent_task_id ?? null,
      created_by: user.id,
    })
    .select()
    .single();
  if (error) throw error;
  const tarefa = data as FunilTarefa;
  dispararEventoModulo(MODULO_KEY, "tarefa.criada", { tarefa }).catch(
    () => {},
  );
  return tarefa;
}

export async function atualizarTarefa(
  id: string,
  updates: Partial<
    FunilTarefaInput & { completed_at: string | null; posicao: number }
  >,
): Promise<FunilTarefa> {
  const { data: before } = await supabase
    .from("funis_tarefas")
    .select("completed_at")
    .eq("id", id)
    .single();
  const { data, error } = await supabase
    .from("funis_tarefas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  const tarefa = data as FunilTarefa;
  if (!before?.completed_at && tarefa.completed_at) {
    dispararEventoModulo(
      MODULO_KEY,
      "tarefa.concluida",
      { tarefa },
    ).catch(() => {});
  }
  return tarefa;
}

export async function moverTarefa(
  tarefaId: string,
  novaColunaId: string,
  novaPosicao: number,
): Promise<FunilTarefa> {
  const { data: before } = await supabase
    .from("funis_tarefas")
    .select("coluna_id")
    .eq("id", tarefaId)
    .single();
  const { data, error } = await supabase
    .from("funis_tarefas")
    .update({ coluna_id: novaColunaId, posicao: novaPosicao })
    .eq("id", tarefaId)
    .select()
    .single();
  if (error) throw error;
  const tarefa = data as FunilTarefa;
  if (before?.coluna_id !== novaColunaId) {
    dispararEventoModulo(
      MODULO_KEY,
      "tarefa.movida",
      { tarefa, colunaAnterior: before?.coluna_id },
    ).catch(() => {});
  }
  return tarefa;
}

export async function reordenarTarefas(
  colunaId: string,
  tarefaIds: string[],
): Promise<void> {
  const updates = tarefaIds.map((id, idx) =>
    supabase.from("funis_tarefas").update({ posicao: idx }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const err = results.find((r) => r.error);
  if (err) throw err.error;
}

export async function deletarTarefa(id: string): Promise<void> {
  const { error } = await supabase.from("funis_tarefas").delete().eq("id", id);
  if (error) throw error;
}

