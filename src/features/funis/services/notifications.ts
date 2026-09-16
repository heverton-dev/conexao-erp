import { supabase } from "~/core/supabase";
import type { Notification } from "../types";

export async function listarNotificacoes(
  userId: string,
  limit = 20,
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("funis_notificacoes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function marcarComoLida(id: string): Promise<void> {
  const { error } = await supabase
    .from("funis_notificacoes")
    .update({ lida: true })
    .eq("id", id);
  if (error) throw error;
}

export async function marcarTodasComoLidas(userId: string): Promise<void> {
  const { error } = await supabase
    .from("funis_notificacoes")
    .update({ lida: true })
    .eq("user_id", userId)
    .eq("lida", false);
  if (error) throw error;
}

export async function contarNaoLidas(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("funis_notificacoes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("lida", false);
  if (error) throw error;
  return count ?? 0;
}

export async function criarNotificacao(
  userId: string,
  titulo: string,
  mensagem?: string,
  link?: string,
  empresaId?: string,
): Promise<void> {
  const { error } = await supabase.from("funis_notificacoes").insert({
    user_id: userId,
    titulo,
    mensagem: mensagem ?? null,
    link: link ?? null,
    empresa_id: empresaId ?? null,
  });
  if (error) throw error;
}
