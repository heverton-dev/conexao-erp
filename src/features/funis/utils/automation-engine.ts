import { supabase } from "~/core/supabase";
import type { Automation, FunilTarefa } from "../types";

export async function verificarEAExecutarTriggers(
  trigger: string,
  tarefaId: string,
  dados?: Record<string, unknown>,
) {
  const { data: tarefa } = await supabase
    .from("funis_tarefas")
    .select("*, coluna:funis_colunas(*)")
    .eq("id", tarefaId)
    .single();
  if (!tarefa) return;

  const { data: automacoes } = await supabase
    .from("funis_automacoes")
    .select("*")
    .eq("funil_id", tarefa.funil_id)
    .eq("trigger_type", trigger)
    .eq("ativo", true);

  if (!automacoes?.length) return;

  for (const auto of automacoes) {
    const config = auto.trigger_config as Record<string, unknown>;
    if (matchTriggerConfig(trigger, config, tarefa, dados)) {
      await executarAcao(auto as Automation, tarefaId, tarefa);
    }
  }
}

function matchTriggerConfig(
  trigger: string,
  config: Record<string, unknown>,
  tarefa: any,
  dados?: Record<string, unknown>,
): boolean {
  switch (trigger) {
    case "tarefa_criada":
      return !config.coluna_id || config.coluna_id === tarefa.coluna_id;
    case "tarefa_movida":
      return (
        (!config.para_coluna || config.para_coluna === dados?.nova_coluna_id) &&
        (!config.de_coluna || config.de_coluna === dados?.coluna_anterior)
      );
    case "tarefa_concluida":
      return true;
    case "tarefa_atrasada":
      return true;
    case "label_adicionado":
      return !config.label_id || config.label_id === dados?.label_id;
    case "comentario_adicionado":
      return true;
    default:
      return false;
  }
}

async function executarAcao(
  automation: Automation,
  tarefaId: string,
  tarefa: any,
) {
  const config = automation.action_config as Record<string, unknown>;
  switch (automation.action_type) {
    case "mover_para_coluna":
      await supabase
        .from("funis_tarefas")
        .update({ coluna_id: config.coluna_id })
        .eq("id", tarefaId);
      break;
    case "atribuir_usuario":
      await supabase
        .from("funis_tarefas")
        .update({ atribuido_para: config.user_id })
        .eq("id", tarefaId);
      break;
    case "alterar_prioridade":
      await supabase
        .from("funis_tarefas")
        .update({ prioridade: config.prioridade })
        .eq("id", tarefaId);
      break;
    case "adicionar_label":
      await supabase
        .from("funis_etiquetas_tarefa")
        .insert({ tarefa_id: tarefaId, label_id: config.label_id });
      break;
    case "remover_label":
      await supabase
        .from("funis_etiquetas_tarefa")
        .delete()
        .eq("tarefa_id", tarefaId)
        .eq("label_id", config.label_id);
      break;
    case "enviar_notificacao": {
      const userIds = (config.user_ids as string[]) || [];
      for (const uid of userIds)
        await supabase
          .from("funis_notificacoes")
          .insert({
            user_id: uid,
            titulo: automation.nome,
            mensagem: config.mensagem || "Notificação automática",
            link: `/funis/funil/${automation.funil_id}`,
          });
      break;
    }
    case "criar_tarefa":
      await supabase
        .from("funis_tarefas")
        .insert({
          funil_id: automation.funil_id,
          coluna_id: config.coluna_id || tarefa.coluna_id,
          titulo: config.titulo || "Nova tarefa automática",
          descricao: config.descricao || null,
          prioridade: config.prioridade || "medium",
          tools: [],
          created_by: tarefa.created_by,
        });
      break;
  }
}
