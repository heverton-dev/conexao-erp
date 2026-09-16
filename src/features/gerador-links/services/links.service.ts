import { supabase } from "~/core/supabase";
import type { LinkSalvo, TipoLink } from "../types";

export async function listarLinks(): Promise<LinkSalvo[]> {
  const { data } = await supabase
    .from("gerador_links")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as LinkSalvo[]) || [];
}
export async function criarLink(input: {
  tipo: TipoLink;
  titulo: string;
  url_gerada: string;
  params: Record<string, string>;
}): Promise<LinkSalvo> {
  const { data } = await supabase
    .from("gerador_links")
    .insert(input)
    .select()
    .single();
  return data as LinkSalvo;
}

export async function atualizarLink(
  id: string,
  input: { titulo?: string; url_gerada?: string; params?: Record<string, string> },
): Promise<LinkSalvo> {
  const { data } = await supabase.from("gerador_links").update(input).eq("id", id).select().single();
  return data as LinkSalvo;
}

export async function deletarLink(id: string): Promise<void> {
  await supabase.from("gerador_links").delete().eq("id", id);
}

export async function getLinkById(id: string): Promise<LinkSalvo | null> {
  const { data } = await supabase
    .from("gerador_links")
    .select("*")
    .eq("id", id)
    .single();
  return data as LinkSalvo | null;
}
