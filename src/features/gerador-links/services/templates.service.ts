import { supabase } from "~/core/supabase";
import type { TemplateMensagem, TipoTemplate } from "../types";

export async function listarTemplates(): Promise<TemplateMensagem[]> {
  const { data } = await supabase
    .from("gerador_modelos")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as TemplateMensagem[]) || [];
}
export async function criarTemplate(input: {
  tipo: TipoTemplate;
  nome: string;
  conteudo: Record<string, string>;
}): Promise<TemplateMensagem> {
  const { data } = await supabase
    .from("gerador_modelos")
    .insert(input)
    .select()
    .single();
  return data as TemplateMensagem;
}

export async function atualizarTemplate(
  id: string,
  input: { nome?: string; conteudo?: Record<string, string> },
): Promise<TemplateMensagem> {
  const { data } = await supabase.from("gerador_modelos").update(input).eq("id", id).select().single();
  return data as TemplateMensagem;
}

export async function deletarTemplate(id: string): Promise<void> {
  await supabase.from("gerador_modelos").delete().eq("id", id);
}
