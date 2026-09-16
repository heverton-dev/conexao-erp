import { supabase } from "~/core/supabase";
import type { Recurring, RecurringInput } from "../types";

export async function listarRecorrencias(
  funilId: string,
): Promise<Recurring[]> {
  const { data, error } = await supabase
    .from("funis_recorrentes")
    .select("*, tarefa:funis_tarefas(*)")
    .eq("tarefa.funil_id", funilId)
    .order("proxima_exec", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Recurring[];
}

export async function listarRecorrenciasTarefa(
  tarefaId: string,
): Promise<Recurring[]> {
  const { data, error } = await supabase
    .from("funis_recorrentes")
    .select("*")
    .eq("tarefa_id", tarefaId);
  if (error) throw error;
  return (data ?? []) as Recurring[];
}

export async function criarRecorrencia(
  input: RecurringInput,
): Promise<Recurring> {
  const proximaExec = calcularProximaExec(input.frequencia, input.config);

  const { data, error } = await supabase
    .from("funis_recorrentes")
    .insert({
      tarefa_id: input.tarefa_id,
      frequencia: input.frequencia,
      config: input.config,
      proxima_exec: proximaExec,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Recurring;
}

export async function atualizarRecorrencia(
  id: string,
  input: Partial<RecurringInput>,
): Promise<Recurring> {
  const updates: Record<string, unknown> = {};
  if (input.frequencia) updates.frequencia = input.frequencia;
  if (input.config) {
    updates.config = input.config;
    updates.proxima_exec = calcularProximaExec(
      input.frequencia ?? "diaria",
      input.config,
    );
  }

  const { data, error } = await supabase
    .from("funis_recorrentes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Recurring;
}

export async function deletarRecorrencia(id: string): Promise<void> {
  const { error } = await supabase
    .from("funis_recorrentes")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleRecorrencia(
  id: string,
  ativo: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("funis_recorrentes")
    .update({ ativo })
    .eq("id", id);
  if (error) throw error;
}

function calcularProximaExec(
  frequencia: string,
  config: Record<string, unknown>,
): string {
  const now = new Date();
  const hora = (config.hora as string) ?? "09:00";
  const [h, m] = hora.split(":").map(Number);

  const next = new Date(now);
  next.setHours(h, m, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  switch (frequencia) {
    case "diaria":
      break;
    case "semanal": {
      const diaSemana = (config.dia_semana as number) ?? 1;
      while (next.getDay() !== diaSemana) {
        next.setDate(next.getDate() + 1);
      }
      break;
    }
    case "mensal": {
      const diaMes = (config.dia_mes as number) ?? 1;
      next.setDate(diaMes);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      break;
    }
    case "personalizada": {
      const intervalo = (config.intervalo_dias as number) ?? 1;
      next.setDate(next.getDate() + intervalo - 1);
      break;
    }
  }

  return next.toISOString();
}
