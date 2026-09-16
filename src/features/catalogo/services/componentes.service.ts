import { supabase } from "~/core/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"
import type { CatalogoAbutment, CatalogoCpsTipoReabilitacao, CatalogoCpsTipoAbutment, CatalogoComponente, CatalogoImplante } from "../types"

const MODULO_KEY = "catalogo"

// ============================================================
// Tipos de Reabilitação
// ============================================================

export async function listarTiposReabilitacao(): Promise<CatalogoCpsTipoReabilitacao[]> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_reabilitacao")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoCpsTipoReabilitacao[]
}

export async function criarTipoReabilitacao(input: { nome: string; sigla?: string }): Promise<CatalogoCpsTipoReabilitacao> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_reabilitacao")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCpsTipoReabilitacao
}

export async function toggleTipoReabilitacaoAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_reabilitacao").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerTipoReabilitacao(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_reabilitacao").delete().eq("id", id)
  if (error) throw error
}

export async function atualizarTipoReabilitacao(id: string, input: { nome?: string; sigla?: string | null; ativo?: boolean }): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_reabilitacao").update(input).eq("id", id)
  if (error) throw error
}

export async function listarReabFamilias(): Promise<{ tipo_reabilitacao_id: string; familia_id: string }[]> {
  const { data, error } = await supabase.from("catalogo_cps_tipos_reabilitacao_familias").select("*")
  if (error) throw error
  return (data ?? []) as { tipo_reabilitacao_id: string; familia_id: string }[]
}

export async function salvarReabFamilias(tipoReabId: string, familiaIds: string[]): Promise<void> {
  await supabase.from("catalogo_cps_tipos_reabilitacao_familias").delete().eq("tipo_reabilitacao_id", tipoReabId)
  if (familiaIds.length === 0) return
  const rows = familiaIds.map(fid => ({ tipo_reabilitacao_id: tipoReabId, familia_id: fid }))
  const { error } = await supabase.from("catalogo_cps_tipos_reabilitacao_familias").insert(rows)
  if (error) throw error
}

// ============================================================
// Tipos de Abutment
// ============================================================

export async function listarTiposAbutment(): Promise<CatalogoCpsTipoAbutment[]> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_abutments")
    .select("*, tipo_reabilitacao:catalogo_cps_tipos_reabilitacao(*)")
    .order("nome")
  if (error) throw error
  return data as CatalogoCpsTipoAbutment[]
}

export async function criarTipoAbutment(input: { nome: string; sigla?: string; tipo_reabilitacao_id?: string }): Promise<CatalogoCpsTipoAbutment> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_abutments")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCpsTipoAbutment
}

export async function toggleTipoAbutmentAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_abutments").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerTipoAbutment(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_abutments").delete().eq("id", id)
  if (error) throw error
}

export async function atualizarTipoAbutment(id: string, input: { nome?: string; sigla?: string | null; ativo?: boolean; tipo_reabilitacao_id?: string | null }): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_abutments").update(input).eq("id", id)
  if (error) throw error
}

// ============================================================
// Tipos de Componentes (NOVO)
// ============================================================

export async function listarTiposComponentes(): Promise<import("../types").CatalogoCpsTipoComponente[]> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_componentes")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as import("../types").CatalogoCpsTipoComponente[]
}

export async function criarTipoComponente(input: { nome: string; sigla?: string; categoria_id?: string }): Promise<import("../types").CatalogoCpsTipoComponente> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_componentes")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as import("../types").CatalogoCpsTipoComponente
}

export async function toggleTipoComponenteAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_componentes").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerTipoComponente(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_componentes").delete().eq("id", id)
  if (error) throw error
}

export async function atualizarTipoComponente(id: string, input: { nome?: string; sigla?: string | null; ativo?: boolean }): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_componentes").update(input).eq("id", id)
  if (error) throw error
}

// ============================================================
// Tipos de Parafusos (NOVO)
// ============================================================

export async function listarTiposParafusos(): Promise<import("../types").CatalogoCpsTipoParafuso[]> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_parafusos")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as import("../types").CatalogoCpsTipoParafuso[]
}

export async function criarTipoParafuso(input: { nome: string; sigla?: string }): Promise<import("../types").CatalogoCpsTipoParafuso> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_parafusos")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as import("../types").CatalogoCpsTipoParafuso
}

export async function toggleTipoParafusoAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_parafusos").update({ ativo }).eq("id", id)
  if (error) throw error
}
export async function removerTipoParafuso(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_parafusos").delete().eq("id", id)
  if (error) throw error
}

export async function atualizarTipoParafuso(id: string, input: { nome?: string; sigla?: string | null; ativo?: boolean }): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_parafusos").update(input).eq("id", id)
  if (error) throw error
}

// ============================================================
// Tipos de Cicatrizadores (NOVO)
// ============================================================

export async function listarTiposCicatrizadores(): Promise<import("../types").CatalogoCpsTipoCicatrizador[]> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_cicatrizadores")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as import("../types").CatalogoCpsTipoCicatrizador[]
}

export async function criarTipoCicatrizador(input: { nome: string; sigla?: string }): Promise<import("../types").CatalogoCpsTipoCicatrizador> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_cicatrizadores")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as import("../types").CatalogoCpsTipoCicatrizador
}

export async function toggleTipoCicatrizadorAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_cicatrizadores").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerTipoCicatrizador(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_cicatrizadores").delete().eq("id", id)
  if (error) throw error
}

export async function atualizarTipoCicatrizador(id: string, input: { nome?: string; sigla?: string | null; ativo?: boolean }): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_cicatrizadores").update(input).eq("id", id)
  if (error) throw error
}

// ============================================================
// Abutments (REESCRITO)
// ============================================================

export async function listarAbutments(): Promise<CatalogoAbutment[]> {
  const { data, error } = await supabase
    .from("catalogo_abutments")
    .select("*, tipo_abutment:catalogo_cps_tipos_abutments(*), parafuso:catalogo_parafusos!fk_abutments_parafuso(*), chave:catalogo_chaves!fk_abutments_chave(*)")
    .order("sku")
  if (error) throw error
  return data as CatalogoAbutment[]
}

export async function getAbutmentDetalhe(sku: string): Promise<CatalogoAbutment | null> {
  const { data, error } = await supabase
    .from("catalogo_abutments")
    .select("*, tipo_abutment:catalogo_cps_tipos_abutments(*, tipo_reabilitacao:catalogo_cps_tipos_reabilitacao(*)), parafuso:catalogo_parafusos!fk_abutments_parafuso(sku, nome), chave:catalogo_chaves!fk_abutments_chave(sku, nome)")
    .eq("sku", sku)
    .single()
  if (error) throw error
  return data as CatalogoAbutment
}

export async function criarAbutment(input: {
  sku: string; nome: string; tipo_abutment_id: string
  parafuso_id?: string; chave_id?: string
  sigla?: string; descricao?: string
  diametro_plataforma_mm?: number; altura_transmucoso_mm?: number
  altura_corpo_mm?: number; angulacao_graus?: number
  torque_ncm?: number; material?: string; preco?: number
}): Promise<CatalogoAbutment> {
  const { data, error } = await supabase
    .from("catalogo_abutments")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.criado", { sku: data.sku, tipo: "abutment" }).catch(() => {})
  return data as CatalogoAbutment
}

export async function atualizarAbutment(sku: string, input: Partial<{
  nome: string; tipo_abutment_id: string; parafuso_id: string; chave_id: string
  sigla: string; descricao: string
  diametro_plataforma_mm: number; altura_transmucoso_mm: number
  altura_corpo_mm: number; angulacao_graus: number
  torque_ncm: number; material: string; preco: number; ativo: boolean
}>): Promise<CatalogoAbutment> {
  const { data, error } = await supabase
    .from("catalogo_abutments")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.atualizado", { sku, tipo: "abutment" }).catch(() => {})
  return data as CatalogoAbutment
}

export async function toggleAbutmentAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_abutments").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerAbutment(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_abutments").delete().eq("sku", sku)
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.removido", { sku, tipo: "abutment" }).catch(() => {})
}

// ============================================================
// Composição do Abutment (N:M)
// ============================================================

async function getChaveIdsBySku(skus: string[]): Promise<string[]> {
  if (skus.length === 0) return []
  const { data } = await supabase.from("catalogo_chaves").select("id").in("sku", skus)
  return (data as { id: string }[] | null)?.map((r) => r.id) ?? []
}

export async function salvarAbutmentChaves(abutmentSku: string, chaveSkus: string[]): Promise<void> {
  await supabase.from("catalogo_abutment_chaves").delete().eq("abutment_sku", abutmentSku)
  if (chaveSkus.length === 0) return
  const rows = chaveSkus.map((sku) => ({ abutment_sku: abutmentSku, chave_id: sku }))
  const { error } = await supabase.from("catalogo_abutment_chaves").insert(rows)
  if (error) throw error
}

export async function listarAbutmentChaves(abutmentSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_abutment_chaves")
    .select("chave_id")
    .eq("abutment_sku", abutmentSku)
  if (error) throw error
  return (data as { chave_id: string }[] | null)?.map((r) => r.chave_id) ?? []
}

export async function salvarAbutmentKits(abutmentSku: string, kitSkus: string[]): Promise<void> {
  await supabase.from("catalogo_abutment_kits").delete().eq("abutment_sku", abutmentSku)
  if (kitSkus.length === 0) return
  const rows = kitSkus.map((kitSku) => ({ abutment_sku: abutmentSku, kit_sku: kitSku }))
  const { error } = await supabase.from("catalogo_abutment_kits").insert(rows)
  if (error) throw error
}

export async function listarAbutmentKits(abutmentSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_abutment_kits")
    .select("kit_sku")
    .eq("abutment_sku", abutmentSku)
  if (error) throw error
  return (data as { kit_sku: string }[]).map((r) => r.kit_sku)
}

export async function salvarAbutmentParafusos(abutmentSku: string, parafusoSkus: string[]): Promise<void> {
  await supabase.from("catalogo_abutment_parafusos").delete().eq("abutment_sku", abutmentSku)
  if (parafusoSkus.length === 0) return
  const rows = parafusoSkus.map((parafusoSku) => ({ abutment_sku: abutmentSku, parafuso_sku: parafusoSku }))
  const { error } = await supabase.from("catalogo_abutment_parafusos").insert(rows)
  if (error) throw error
}

export async function listarAbutmentParafusos(abutmentSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_abutment_parafusos")
    .select("parafuso_sku")
    .eq("abutment_sku", abutmentSku)
  if (error) throw error
  return (data as { parafuso_sku: string }[]).map((r) => r.parafuso_sku)
}

/** Implantes compatíveis com o abutment — reaproveita a pivot catalogo_implante_abutment (editada até então só pelo lado do implante) */
export async function salvarAbutmentImplantes(abutmentSku: string, implanteSkus: string[]): Promise<void> {
  await supabase.from("catalogo_implante_abutment").delete().eq("abutment_sku", abutmentSku)
  if (implanteSkus.length === 0) return
  const rows = implanteSkus.map((implanteSku) => ({ implante_sku: implanteSku, abutment_sku: abutmentSku }))
  const { error } = await supabase.from("catalogo_implante_abutment").insert(rows)
  if (error) throw error
}

export async function listarAbutmentImplantes(abutmentSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_abutment")
    .select("implante_sku")
    .eq("abutment_sku", abutmentSku)
  if (error) throw error
  return (data as { implante_sku: string }[]).map((r) => r.implante_sku)
}

/** Implantes compatíveis, com linha/família aninhadas — para a aba "Compatibilidade" do detail público */
export async function listarImplantesDoAbutment(abutmentSku: string): Promise<CatalogoImplante[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_abutment")
    .select("implante:catalogo_implantes(*, linha:catalogo_ips_linhas(*, familia:catalogo_ips_familias(*)))")
    .eq("abutment_sku", abutmentSku)
  if (error) throw error
  return (data as unknown as { implante: CatalogoImplante }[]).map((r) => r.implante).filter(Boolean)
}

// ============================================================
// Componentes (NOVO)
// ============================================================

export async function listarComponentes(): Promise<CatalogoComponente[]> {
  const { data, error } = await supabase
    .from("catalogo_componentes")
    .select("*, tipo_componente:catalogo_cps_tipos_componentes(*), tipo_abutment:catalogo_cps_tipos_abutments(*), parafuso:catalogo_parafusos(*), chave:catalogo_chaves(*)")
    .order("sku")
  if (error) throw error
  return data as CatalogoComponente[]
}

export async function getComponenteDetalhe(sku: string): Promise<CatalogoComponente | null> {
  const { data, error } = await supabase
    .from("catalogo_componentes")
    .select("*, tipo_componente:catalogo_cps_tipos_componentes(*), tipo_abutment:catalogo_cps_tipos_abutments(*), parafuso:catalogo_parafusos(*), chave:catalogo_chaves(*)")
    .eq("sku", sku)
    .single()
  if (error) throw error
  return data as CatalogoComponente
}

export async function criarComponente(input: {
  sku: string; nome: string; tipo_componente_id?: string; tipo_abutment_id?: string
  parafuso_id?: string; chave_id?: string
  sigla?: string; descricao?: string
  diametro_plataforma_mm?: number; altura_transmucoso_mm?: number
  altura_corpo_mm?: number; angulacao_graus?: number
  tipo?: string; tipo_travamento?: string; material?: string; preco?: number
}): Promise<CatalogoComponente> {
  const { data, error } = await supabase
    .from("catalogo_componentes")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.criado", { sku: data.sku, tipo: "componente" }).catch(() => {})
  return data as CatalogoComponente
}

export async function atualizarComponente(sku: string, input: Partial<{
  nome: string; tipo_componente_id: string; tipo_abutment_id: string
  parafuso_id: string; chave_id: string
  sigla: string; descricao: string
  diametro_plataforma_mm: number; altura_transmucoso_mm: number
  altura_corpo_mm: number; angulacao_graus: number
  tipo: string; tipo_travamento: string; material: string; preco: number; ativo: boolean
}>): Promise<CatalogoComponente> {
  const { data, error } = await supabase
    .from("catalogo_componentes")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoComponente
}

export async function toggleComponenteAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_componentes").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerComponente(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_componentes").delete().eq("sku", sku)
  if (error) throw error
}
