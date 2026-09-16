import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";

const MODULO_KEY = "funis";

export async function processarRecorrencias() {
  const now = new Date().toISOString();
  const { data: recorrencias } = await supabase
    .from("funis_recorrentes")
    .select("*, tarefa:funis_tarefas(*)")
    .eq("ativo", true)
    .lte("proxima_exec", now);
  if (!recorrencias?.length) return;

  for (const rec of recorrencias) {
    const tarefa = rec.tarefa as any;
    if (!tarefa) continue;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("funis_tarefas").insert({
      funil_id: tarefa.funil_id,
      coluna_id: tarefa.coluna_id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      atribuido_para: tarefa.atribuido_para,
      tools: tarefa.tools,
      data_inicio: tarefa.data_inicio,
      data_fim: tarefa.data_fim,
      created_by: user?.id || tarefa.created_by,
    });
    if (!error) {
      const proxima = calcularProxima(
        rec.frequencia,
        rec.config as Record<string, unknown>,
      );
      await supabase
        .from("funis_recorrentes")
        .update({ proxima_exec: proxima })
        .eq("id", rec.id);
    }
  }
}

export async function verificarTarefasAtrasadas() {
  const now = new Date().toISOString();
  const { data: tarefas } = await supabase
    .from("funis_tarefas")
    .select("*")
    .lt("data_fim", now)
    .is("completed_at", null)
    .is("archived_at", null);
  if (!tarefas?.length) return;

  for (const tarefa of tarefas) {
    const { data: automacoes } = await supabase
      .from("funis_automacoes")
      .select("*")
      .eq("funil_id", tarefa.funil_id)
      .eq("trigger_type", "tarefa_atrasada")
      .eq("ativo", true);
    if (!automacoes?.length) continue;
    for (const auto of automacoes) {
      const config = auto.action_config as Record<string, unknown>;
      if (auto.action_type === "enviar_notificacao") {
        const userIds = [
          ...new Set([
            ...((config.user_ids as string[]) || []),
            ...(tarefa.atribuido_para ? [tarefa.atribuido_para] : []),
          ]),
        ];
        for (const uid of userIds)
          await supabase
            .from("funis_notificacoes")
            .insert({
              user_id: uid,
              titulo: "Tarefa atrasada",
              mensagem: `A tarefa "${tarefa.titulo}" está atrasada`,
              link: `/funis/funil/${tarefa.funil_id}`,
            });
      }
    }

    dispararEventoModulo(MODULO_KEY, "tarefa.atrasada", { tarefa_id: tarefa.id, titulo: tarefa.titulo, funil_id: tarefa.funil_id, data_fim: tarefa.data_fim }).catch(() => {});
  }
}

function calcularProxima(
  frequencia: string,
  config: Record<string, unknown>,
): string {
  const now = new Date();
  const hora = (config.hora as string) ?? "09:00";
  const [h, m] = hora.split(":").map(Number);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  if (frequencia === "semanal") {
    while (next.getDay() !== ((config.dia_semana as number) ?? 1))
      next.setDate(next.getDate() + 1);
  } else if (frequencia === "mensal") {
    next.setDate((config.dia_mes as number) ?? 1);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  } else if (frequencia === "personalizada")
    next.setDate(next.getDate() + ((config.intervalo_dias as number) ?? 1) - 1);
  return next.toISOString();
}
