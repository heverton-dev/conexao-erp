import { supabase } from "~/core/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"
import { friendlyDbError } from "../lib/dbError"
import type { CatalogoLinkTeste, LinkTesteNivelAcesso } from "../types"

const MODULO_KEY = "catalogo"

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 32)
}

export async function listarLinksTeste(): Promise<CatalogoLinkTeste[]> {
  const { data, error } = await supabase
    .from("catalogo_links_teste")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(friendlyDbError(error))
  return data as CatalogoLinkTeste[]
}

export async function criarLinkTeste(input: {
  nivelAcesso: LinkTesteNivelAcesso
  descricao?: string
  expiresAt?: string | null
  maxUsos?: number | null
  createdBy?: string | null
}): Promise<CatalogoLinkTeste> {
  const { data, error } = await supabase
    .from("catalogo_links_teste")
    .insert({
      token: generateToken(),
      nivel_acesso: input.nivelAcesso,
      descricao: input.descricao || null,
      expires_at: input.expiresAt || null,
      max_usos: input.maxUsos ?? null,
      created_by: input.createdBy ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(friendlyDbError(error))
  dispararEventoModulo(MODULO_KEY, "link_teste.criado", { link_id: data.id, nivel_acesso: data.nivel_acesso }).catch(() => {})
  return data as CatalogoLinkTeste
}

export async function atualizarLinkTeste(
  id: string,
  input: Partial<{ descricao: string | null; ativo: boolean; expiresAt: string | null; maxUsos: number | null }>,
): Promise<CatalogoLinkTeste> {
  const { data, error } = await supabase
    .from("catalogo_links_teste")
    .update({
      ...(input.descricao !== undefined && { descricao: input.descricao }),
      ...(input.ativo !== undefined && { ativo: input.ativo }),
      ...(input.expiresAt !== undefined && { expires_at: input.expiresAt }),
      ...(input.maxUsos !== undefined && { max_usos: input.maxUsos }),
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(friendlyDbError(error))
  return data as CatalogoLinkTeste
}

export async function revogarLinkTeste(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_links_teste").update({ ativo: false }).eq("id", id)
  if (error) throw new Error(friendlyDbError(error))
}

export async function removerLinkTeste(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_links_teste").delete().eq("id", id)
  if (error) throw new Error(friendlyDbError(error))
}

export type ValidacaoLinkTeste =
  | { valido: true; link: CatalogoLinkTeste }
  | { valido: false; motivo: "nao_encontrado" | "inativo" | "expirado" | "esgotado" }

export async function validarLinkTeste(token: string): Promise<ValidacaoLinkTeste> {
  const { data, error } = await supabase
    .from("catalogo_links_teste")
    .select("*")
    .eq("token", token)
    .single()
  if (error || !data) return { valido: false, motivo: "nao_encontrado" }
  const link = data as CatalogoLinkTeste
  if (!link.ativo) return { valido: false, motivo: "inativo" }
  if (link.expires_at && new Date(link.expires_at) < new Date()) return { valido: false, motivo: "expirado" }
  if (link.max_usos != null && link.usos >= link.max_usos) return { valido: false, motivo: "esgotado" }
  return { valido: true, link }
}

export async function registrarAcessoLinkTeste(link: CatalogoLinkTeste, userId?: string | null): Promise<void> {
  await supabase.from("catalogo_links_teste_acessos").insert({
    link_id: link.id,
    user_id: userId || null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  })
  await supabase.from("catalogo_links_teste").update({ usos: link.usos + 1 }).eq("id", link.id)
  dispararEventoModulo(MODULO_KEY, "link_teste.acessado", { link_id: link.id, nivel_acesso: link.nivel_acesso }).catch(() => {})
}

export async function listarAcessosDoLink(linkId: string) {
  const { data, error } = await supabase
    .from("catalogo_links_teste_acessos")
    .select("*")
    .eq("link_id", linkId)
    .order("acessado_em", { ascending: false })
  if (error) throw new Error(friendlyDbError(error))
  return data
}
