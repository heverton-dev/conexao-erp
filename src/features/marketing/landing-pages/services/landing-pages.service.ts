import { supabase } from "~/core/supabase";
import type { LandingPage, LandingPageVersao } from "../types";

export async function listarLandingPages(
  empresaId: string,
): Promise<LandingPage[]> {
  const { data } = await supabase
    .from("mktg_landing_pages")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("updated_at", { ascending: false });
  return (data as LandingPage[]) || [];
}

export async function criarLandingPage(
  empresaId: string,
  titulo: string,
  template?: string,
): Promise<LandingPage | null> {
  const slug = titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const { data } = await supabase
    .from("mktg_landing_pages")
    .insert({
      empresa_id: empresaId,
      titulo,
      slug,
      conteudo: {},
      template: template || null,
    })
    .select()
    .single();
  return data as LandingPage | null;
}

export async function atualizarLandingPage(
  id: string,
  updates: Partial<LandingPage>,
): Promise<LandingPage | null> {
  const { data } = await supabase
    .from("mktg_landing_pages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return data as LandingPage | null;
}

export async function deletarLandingPage(id: string): Promise<void> {
  const { error } = await supabase.from("mktg_landing_pages").delete().eq("id", id);
  if (error) throw error;
}

export async function salvarVersao(
  lpId: string,
  conteudo: Record<string, unknown>,
  criadoPor: string,
): Promise<void> {
  await supabase
    .from("mktg_landing_pages_versoes")
    .insert({ landing_page_id: lpId, conteudo, criado_por: criadoPor });
}
