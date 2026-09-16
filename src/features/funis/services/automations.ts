import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Automation, AutomationInput } from "../types";

const MODULO_KEY = "funis";

export async function listarAutomacoes(funilId: string): Promise<Automation[]> {
  const { data, error } = await supabase
    .from("funis_automacoes")
    .select("*")
    .eq("funil_id", funilId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Automation[];
}

export async function criarAutomacao(
  input: AutomationInput,
  empresaId?: string | null,
): Promise<Automation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("funis_automacoes")
    .insert({
      funil_id: input.funil_id,
      nome: input.nome,
      trigger_type: input.trigger_type,
      trigger_config: input.trigger_config ?? {},
      action_type: input.action_type,
      action_config: input.action_config ?? {},
      created_by: user.id,
      empresa_id: empresaId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Automation;
}

export async function atualizarAutomacao(
  id: string,
  input: Partial<AutomationInput>,
): Promise<Automation> {
  const { data, error } = await supabase
    .from("funis_automacoes")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Automation;
}

export async function deletarAutomacao(id: string): Promise<void> {
  const { error } = await supabase
    .from("funis_automacoes")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleAutomacao(
  id: string,
  ativo: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("funis_automacoes")
    .update({ ativo })
    .eq("id", id);
  if (error) throw error;
}

export async function listarAutomacoesPorTrigger(
  funilId: string,
  triggerType: string,
): Promise<Automation[]> {
  const { data, error } = await supabase
    .from("funis_automacoes")
    .select("*")
    .eq("funil_id", funilId)
    .eq("trigger_type", triggerType)
    .eq("ativo", true);
  if (error) throw error;
  return (data ?? []) as Automation[];
}

export async function executarAutomacao(
  automationId: string,
  tarefaId: string,
  dados?: Record<string, unknown>,
): Promise<void> {
  const { data: automation } = await supabase
    .from("funis_automacoes")
    .select("*")
    .eq("id", automationId)
    .single();

  if (!automation || !automation.ativo) return;

  const config = automation.action_config as Record<string, unknown>;

  switch (automation.action_type) {
    case "mover_para_coluna": {
      await supabase
        .from("funis_tarefas")
        .update({ coluna_id: config.coluna_id as string })
        .eq("id", tarefaId);
      break;
    }
    case "atribuir_usuario": {
      await supabase
        .from("funis_tarefas")
        .update({ atribuido_para: config.user_id as string })
        .eq("id", tarefaId);
      break;
    }
    case "alterar_prioridade": {
      await supabase
        .from("funis_tarefas")
        .update({ prioridade: config.prioridade as string })
        .eq("id", tarefaId);
      break;
    }
    case "adicionar_label": {
      await supabase
        .from("funis_etiquetas_tarefa")
        .insert({ tarefa_id: tarefaId, label_id: config.label_id as string })
        .select();
      break;
    }
    case "remover_label": {
      await supabase
        .from("funis_etiquetas_tarefa")
        .delete()
        .eq("tarefa_id", tarefaId)
        .eq("label_id", config.label_id as string);
      break;
    }
    case "enviar_notificacao": {
      const userIds = (config.user_ids as string[]) || [];
      const mensagem = (config.mensagem as string) || "Notificação automática";
      for (const userId of userIds) {
        await supabase.from("funis_notificacoes").insert({
          user_id: userId,
          titulo: automation.nome,
          mensagem,
          link: `/funis/funil/${automation.funil_id}`,
        });
      }
      break;
    }
  }

  dispararEventoModulo(MODULO_KEY, "automacao.executada", {
    automation,
    tarefa_id: tarefaId,
    dados,
  }).catch(() => {});
}
