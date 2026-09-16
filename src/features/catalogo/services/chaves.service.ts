import { supabase } from "~/core/supabase"
import type { CatalogoChave, CatalogoTipoChave } from "../types"

// ============================================================
// Tipos de Chaves
// ============================================================

export async function listarTiposChaves(): Promise<CatalogoTipoChave[]> {
  const { data, error } = await supabase
    .from("catalogo_tipos_chaves")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoTipoChave[]
}

export async function criarTipoChave(input: { nome: string; sigla?: string }): Promise<CatalogoTipoChave> {
  const { data, error } = await supabase
    .from("catalogo_tipos_chaves")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoTipoChave
}
export async function atualizarTipoChave(id: string, input: Partial<{ nome: string; sigla: string | null; ativo: boolean }>): Promise<CatalogoTipoChave> {
  const { data, error } = await supabase
    .from("catalogo_tipos_chaves")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoTipoChave
}

export async function toggleTipoChaveAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_tipos_chaves").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerTipoChave(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_tipos_chaves").delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Chaves
// ============================================================

export async function listarChaves(): Promise<CatalogoChave[]> {
  const { data, error } = await supabase
    .from("catalogo_chaves")
    .select("*, tipo_chave:catalogo_tipos_chaves(*)")
    .order("nome")
  if (error) throw error
  return data as CatalogoChave[]
}

export async function criarChave(input: {
  sku: string; nome: string; tipo_chave_id?: string
  sigla?: string; descricao?: string; tipo?: string
  comprimento?: string; diametro_mm?: number; material?: string; preco?: number
  preco_euro?: number; preco_dolar?: number; qtd_disponivel?: number; qtd_minima_aviso?: number
}): Promise<CatalogoChave> {
  const { data, error } = await supabase
    .from("catalogo_chaves")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoChave
}

export async function atualizarChave(sku: string, input: Partial<{
  nome: string; tipo_chave_id: string; sigla: string; descricao: string
  tipo: string; comprimento: string; diametro_mm: number; material: string
  preco: number; preco_euro: number; preco_dolar: number
  qtd_disponivel: number; qtd_minima_aviso: number; ativo: boolean
}>): Promise<CatalogoChave> {
  const { data, error } = await supabase
    .from("catalogo_chaves")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoChave
}

export async function toggleChaveAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_chaves").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerChave(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_chaves").delete().eq("sku", sku)
  if (error) throw error
}
