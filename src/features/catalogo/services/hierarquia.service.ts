import { supabase } from "~/core/supabase"
import type {
  CatalogoCategoria, CatalogoIpsConexao, CatalogoIpsFamilia, CatalogoIpsLinha,
} from "../types"

// ============================================================
// Categorias
// ============================================================

const TABLE_CATEGORIAS = "catalogo_categorias"

export async function listarCategorias(): Promise<CatalogoCategoria[]> {
  const { data, error } = await supabase
    .from(TABLE_CATEGORIAS)
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoCategoria[]
}

export async function criarCategoria(input: { nome: string; sigla?: string; locked?: boolean; ativo?: boolean }): Promise<CatalogoCategoria> {
  const { data, error } = await supabase
    .from(TABLE_CATEGORIAS)
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCategoria
}

export async function atualizarCategoria(id: string, input: Partial<{ nome: string; sigla: string | null }>): Promise<CatalogoCategoria> {
  const { data, error } = await supabase
    .from(TABLE_CATEGORIAS)
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCategoria
}

export async function toggleCategoriaAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from(TABLE_CATEGORIAS).update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerCategoria(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_CATEGORIAS).delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Conexões (IPS)
// ============================================================

const TABLE_CONEXOES = "catalogo_ips_conexoes"

export async function listarConexoes(categoriaId?: string): Promise<CatalogoIpsConexao[]> {
  let query = supabase
    .from(TABLE_CONEXOES)
    .select("*, categoria:catalogo_categorias(*)")
    .order("nome")
  if (categoriaId) query = query.eq("categoria_id", categoriaId)
  const { data, error } = await query
  if (error) throw error
  return data as CatalogoIpsConexao[]
}

export async function criarConexao(input: { categoria_id: string; nome: string; sigla: string }): Promise<CatalogoIpsConexao> {
  const { data, error } = await supabase
    .from(TABLE_CONEXOES)
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoIpsConexao
}
export async function atualizarConexao(id: string, input: Partial<{ nome: string; sigla: string; categoria_id: string }>): Promise<CatalogoIpsConexao> {
  const { data, error } = await supabase.from(TABLE_CONEXOES).update(input).eq("id", id).select("*, categoria:catalogo_categorias(*)").single()
  if (error) throw error
  return data as CatalogoIpsConexao
}

export async function toggleConexaoAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from(TABLE_CONEXOES).update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerConexao(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_CONEXOES).delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Famílias (IPS)
// ============================================================

const TABLE_FAMILIAS = "catalogo_ips_familias"

export async function listarFamilias(conexaoId?: string): Promise<CatalogoIpsFamilia[]> {
  let query = supabase
    .from(TABLE_FAMILIAS)
    .select("*, conexao:catalogo_ips_conexoes(*, categoria:catalogo_categorias(*))")
    .order("nome")
  if (conexaoId) query = query.eq("conexao_id", conexaoId)
  const { data, error } = await query
  if (error) throw error
  return data as CatalogoIpsFamilia[]
}

export async function criarFamilia(input: { conexao_id: string; nome: string; cor_identificacao?: string }): Promise<CatalogoIpsFamilia> {
  const { data, error } = await supabase
    .from(TABLE_FAMILIAS)
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoIpsFamilia
}

export async function atualizarFamilia(id: string, input: Partial<{ nome: string; cor_identificacao: string }>): Promise<CatalogoIpsFamilia> {
  const { data, error } = await supabase
    .from(TABLE_FAMILIAS)
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoIpsFamilia
}

export async function toggleFamiliaAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from(TABLE_FAMILIAS).update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerFamilia(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_FAMILIAS).delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Linhas (IPS)
// ============================================================

const TABLE_LINHAS = "catalogo_ips_linhas"

export async function listarLinhas(familiaId?: string): Promise<CatalogoIpsLinha[]> {
  let query = supabase
    .from(TABLE_LINHAS)
    .select("*, familia:catalogo_ips_familias(*)")
    .order("nome")
  if (familiaId) query = query.eq("familia_id", familiaId)
  const { data, error } = await query
  if (error) throw error
  return data as CatalogoIpsLinha[]
}

export async function criarLinha(input: { familia_id: string; nome: string }): Promise<CatalogoIpsLinha> {
  const { data, error } = await supabase
    .from(TABLE_LINHAS)
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoIpsLinha
}
export async function atualizarLinha(id: string, input: Partial<{ nome: string; familia_id: string }>): Promise<CatalogoIpsLinha> {
  const { data, error } = await supabase.from(TABLE_LINHAS).update(input).eq("id", id).select("*, familia:catalogo_ips_familias(*)").single()
  if (error) throw error
  return data as CatalogoIpsLinha
}

export async function toggleLinhaAtiva(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from(TABLE_LINHAS).update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerLinha(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_LINHAS).delete().eq("id", id)
  if (error) throw error
}
