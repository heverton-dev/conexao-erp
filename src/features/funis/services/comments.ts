import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Comment } from "../types";

const MODULO_KEY = "funis";

export async function listarComentarios(tarefaId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("funis_comentarios")
    .select("*, user:profiles!funis_comments_user_id_fkey(full_name, email)")
    .eq("tarefa_id", tarefaId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Comment[];
}

export async function criarComentario(
  tarefaId: string,
  texto: string,
): Promise<Comment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("funis_comentarios")
    .insert({
      tarefa_id: tarefaId,
      user_id: user.id,
      texto,
    })
    .select("*, user:profiles!funis_comments_user_id_fkey(full_name, email)")
    .single();
  if (error) throw error;
  const comment = data as unknown as Comment;

  dispararEventoModulo(MODULO_KEY, "tarefa.comentario_adicionado", {
    comentario: comment,
    tarefa_id: tarefaId,
  }).catch(() => {});
  return comment;
}

export async function atualizarComentario(
  id: string,
  texto: string,
): Promise<Comment> {
  const { data, error } = await supabase
    .from("funis_comentarios")
    .update({ texto })
    .eq("id", id)
    .select("*, user:profiles!funis_comments_user_id_fkey(full_name, email)")
    .single();
  if (error) throw error;
  return data as unknown as Comment;
}

export async function deletarComentario(id: string): Promise<void> {
  const { error } = await supabase.from("funis_comentarios").delete().eq("id", id);
  if (error) throw error;
}
