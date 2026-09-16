import { supabase } from "~/core/supabase";
import type { Activity } from "../types";

export async function listarAtividades(
  opts: { tarefaId?: string; funilId?: string; limit?: number } = {},
): Promise<Activity[]> {
  let query = supabase
    .from("funis_log_atividades")
    .select(
      "*, user:profiles!funis_activity_log_user_id_fkey(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 50);

  if (opts.tarefaId) {
    query = query.eq("tarefa_id", opts.tarefaId);
  }
  if (opts.funilId) {
    query = query.eq("funil_id", opts.funilId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Activity[];
}

export async function registrarAtividade(opts: {
  tarefaId?: string;
  funilId?: string;
  acao: string;
  dados?: Record<string, unknown>;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("funis_log_atividades").insert({
    tarefa_id: opts.tarefaId ?? null,
    funil_id: opts.funilId ?? null,
    user_id: user.id,
    acao: opts.acao,
    dados_json: opts.dados ?? {},
  });
  if (error) throw error;
}
