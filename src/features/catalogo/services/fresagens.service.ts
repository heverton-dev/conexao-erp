import { supabase } from "~/core/supabase"
import type { CatalogoTipoOsso, CatalogoProtocoloFresagem, CatalogoProtocoloFresaItem } from "../types"

// ============================================================
// Tipos de Osso (antes: Tipos de Fresagens)
// ============================================================

export async function listarTiposOsso(): Promise<CatalogoTipoOsso[]> {
  const { data, error } = await supabase
    .from("catalogo_tipos_ossos")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoTipoOsso[]
}

export async function criarTipoOsso(input: { nome: string; sigla?: string | null; categoria?: "hard" | "soft"; ativo?: boolean }): Promise<CatalogoTipoOsso> {
  const { data, error } = await supabase
    .from("catalogo_tipos_ossos")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoTipoOsso
}

export async function toggleTipoOssoAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_tipos_ossos").update({ ativo }).eq("id", id)
  if (error) throw error
}
export async function atualizarTipoOsso(id: string, input: Partial<{ nome: string; sigla: string | null; categoria: "hard" | "soft"; ativo: boolean }>): Promise<CatalogoTipoOsso> {
  const { data, error } = await supabase
    .from("catalogo_tipos_ossos")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoTipoOsso
}

export async function removerTipoOsso(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_tipos_ossos").delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Protocolos de Fresagens
// ============================================================

export async function listarProtocolos(): Promise<CatalogoProtocoloFresagem[]> {
  const { data, error } = await supabase
    .from("catalogo_protocolos_fresagens")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoProtocoloFresagem[]
}

export async function getProtocoloDetalhe(id: string): Promise<CatalogoProtocoloFresagem | null> {
  const { data, error } = await supabase
    .from("catalogo_protocolos_fresagens")
    .select("*, fresas:catalogo_protocolos_fresas_itens(*, fresa:catalogo_fresas(*))")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as CatalogoProtocoloFresagem | null
}

export async function criarProtocolo(input: {
  nome: string; tipo_osso: string; sigla?: string; diametro_mm_aplicavel?: number
}): Promise<CatalogoProtocoloFresagem> {
  const { data, error } = await supabase
    .from("catalogo_protocolos_fresagens")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoProtocoloFresagem
}

export async function atualizarProtocolo(id: string, input: Partial<{
  nome: string; tipo_osso: string; sigla: string; diametro_mm_aplicavel: number; ativo: boolean
}>): Promise<CatalogoProtocoloFresagem> {
  const { data, error } = await supabase
    .from("catalogo_protocolos_fresagens")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoProtocoloFresagem
}

export async function toggleProtocoloAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_protocolos_fresagens").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerProtocolo(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_protocolos_fresagens").delete().eq("id", id)
  if (error) throw error
}
export async function listarDiametrosImplantes(): Promise<number[]> {
  const { data, error } = await supabase.from("catalogo_implantes").select("diametro_mm")
  if (error) throw error
  const unique = Array.from(new Set((data ?? []).map((i: { diametro_mm: number | null }) => i.diametro_mm).filter((v): v is number => v != null)))
  return unique.sort((a: number, b: number) => a - b)
}

// ============================================================
// Fresas do Protocolo (PIVOT com ordenação)
// ============================================================

export async function salvarProtocoloFresas(protocoloId: string, items: { fresa_id: string; ordem: number }[]): Promise<void> {
  // Delete existing items for this protocol
  const { error: deleteError } = await supabase
    .from("catalogo_protocolos_fresas_itens")
    .delete()
    .eq("protocolo_id", protocoloId)
  if (deleteError) throw deleteError

  // Insert new items
  if (items.length > 0) {
    const rows = items.map((f, i) => ({ protocolo_id: protocoloId, fresa_id: f.fresa_id, ordem: i + 1 }))
    const { error } = await supabase.from("catalogo_protocolos_fresas_itens").insert(rows)
    if (error) throw error
  }
}

export async function listarProtocoloFresas(protocoloId: string): Promise<CatalogoProtocoloFresaItem[]> {
  const { data, error } = await supabase
    .from("catalogo_protocolos_fresas_itens")
    .select("*, fresa:catalogo_fresas(*)")
    .eq("protocolo_id", protocoloId)
    .order("ordem")
  if (error) throw error
  return data as CatalogoProtocoloFresaItem[]
}
