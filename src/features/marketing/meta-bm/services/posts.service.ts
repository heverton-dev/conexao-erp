import { supabase } from "~/core/supabase";
import type { MetaPost } from "../types";

export interface CriarPostInput {
  empresa_id: string;
  conteudo: string;
  midia_url?: string;
  plataforma: "facebook" | "instagram" | "both";
  agendado_para?: string;
}

export async function listarPosts(empresaId: string): Promise<MetaPost[]> {
  const { data } = await supabase
    .from("mktg_meta_posts")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  return (data as MetaPost[]) ?? [];
}

export async function criarPost(
  input: CriarPostInput,
): Promise<MetaPost | null> {
  const { data } = await supabase
    .from("mktg_meta_posts")
    .insert({
      empresa_id: input.empresa_id,
      conteudo: input.conteudo,
      midia_url: input.midia_url ?? null,
      plataforma: input.plataforma,
      status: input.agendado_para ? "agendado" : "rascunho",
      agendado_para: input.agendado_para ?? null,
    })
    .select()
    .single();

  return data as MetaPost | null;
}

export async function agendarPost(
  id: string,
  dataAgendamento: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("mktg_meta_posts")
    .update({ status: "agendado", agendado_para: dataAgendamento })
    .eq("id", id);

  return !error;
}

export async function deletarPost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("mktg_meta_posts")
    .delete()
    .eq("id", id);
  return !error;
}
