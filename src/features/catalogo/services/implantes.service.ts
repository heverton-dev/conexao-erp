import { supabase } from "~/core/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"
import type { CatalogoImplante, CatalogoProtocoloFresagem, CatalogoProtocoloFresaItem, CatalogoProtocoloFresagemFlat, CatalogoFresa, CatalogoChave, CatalogoCicatrizador, CatalogoAbutment, CatalogoKit } from "../types"

const MODULO_KEY = "catalogo"


export async function listarImplantesAtivos(): Promise<CatalogoImplante[]> {
  const { data, error } = await supabase
    .from("catalogo_implantes")
    .select(`
      *,
      linha:catalogo_ips_linhas!inner(*, familia:catalogo_ips_familias(*, conexao:catalogo_ips_conexoes(*, categoria:catalogo_categorias(*))))
    `)
    .eq("ativo", true)
    .order("sku")
  if (error) throw error
  return data as CatalogoImplante[]
}

export async function listarTodosImplantes(): Promise<CatalogoImplante[]> {
  const { data, error } = await supabase
    .from("catalogo_implantes")
    .select(`
      *,
      linha:catalogo_ips_linhas(*, familia:catalogo_ips_familias(*, conexao:catalogo_ips_conexoes(*, categoria:catalogo_categorias(*))))
    `)
    .order("sku")
  if (error) throw error
  return data as CatalogoImplante[]
}

export async function getImplanteDetalhe(sku: string): Promise<CatalogoImplante | null> {
  const { data, error } = await supabase
    .from("catalogo_implantes")
    .select(`
      *,
      linha:catalogo_ips_linhas(*, familia:catalogo_ips_familias(*, conexao:catalogo_ips_conexoes(*, categoria:catalogo_categorias(*))))
    `)
    .eq("sku", sku)
    .single()
  if (error) return null
  return data as CatalogoImplante
}

export async function listarImplantesPorLinha(linhaId: string): Promise<CatalogoImplante[]> {
  const { data, error } = await supabase
    .from("catalogo_implantes")
    .select("*")
    .eq("linha_id", linhaId)
    .eq("ativo", true)
    .order("diametro_mm")
  if (error) throw error
  return data as CatalogoImplante[]
}

export async function criarImplante(input: {
  sku: string; nome: string; linha_id: string
  conexao_id?: string; familia_id?: string; categoria_id?: string
  osso_soft?: string; osso_hard?: string
  diametro_mm: number; comprimento_mm: number
  rosca_interna?: string; regiao_apical?: string; regiao_cervical?: string
  torque_insercao?: number; preco?: number
  preco_euro?: number; preco_dolar?: number
  qtd_disponivel?: number; qtd_minima_aviso?: number
  sigla?: string; descricao?: string
  macrogeometria?: string; material?: string; superficie?: string
  diametro_plataforma_mm?: number; ativo?: boolean
}): Promise<CatalogoImplante> {
  const { data, error } = await supabase
    .from("catalogo_implantes")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.criado", { sku: data.sku, tipo: "implante" }).catch(() => {})
  return data as CatalogoImplante
}
export async function atualizarImplante(sku: string, input: Partial<{
  nome: string; linha_id: string; conexao_id: string; familia_id: string
  osso_soft: string; osso_hard: string
  diametro_mm: number; comprimento_mm: number
  rosca_interna: string; regiao_apical: string; regiao_cervical: string
  torque_insercao: number; preco: number
  preco_euro: number; preco_dolar: number
  qtd_disponivel: number; qtd_minima_aviso: number
  sigla: string; descricao: string
  macrogeometria: string; material: string; superficie: string
  diametro_plataforma_mm: number
  detalhes_extras: Record<string, unknown>; ativo: boolean
}>): Promise<CatalogoImplante> {
  const { data, error } = await supabase
    .from("catalogo_implantes")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.atualizado", { sku, tipo: "implante" }).catch(() => {})
  return data as CatalogoImplante
}
export async function toggleImplanteAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_implantes").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerImplante(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_implantes").delete().eq("sku", sku)
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.removido", { sku, tipo: "implante" }).catch(() => {})
}

// ============================================================
// Fresas de um Protocolo (para preview no form)
// ============================================================

export async function listarFresasProtocolo(protocoloId: string): Promise<{ ordem: number; fresa_nome: string; fresa_sku: string; diametro_mm: number | null }[]> {
  // 1. Busca itens do protocolo
  const { data: itens, error } = await supabase
    .from("catalogo_protocolos_fresas_itens")
    .select("ordem, fresa_id")
    .eq("protocolo_id", protocoloId)
    .order("ordem")
  if (error || !itens?.length) return []

  // 2. Busca fresas correspondentes
  const fresaIds = itens.map((i: any) => i.fresa_id).filter(Boolean)
  if (fresaIds.length === 0) return itens.map((i: any) => ({ ordem: i.ordem, fresa_nome: i.fresa_id, fresa_sku: i.fresa_id, diametro_mm: null }))

  const { data: fresas } = await supabase
    .from("catalogo_fresas")
    .select("sku, nome, diametro_mm")
    .in("sku", fresaIds)
  const fresaMap = new Map((fresas ?? []).map((f: any) => [f.sku, f]))

  return itens.map((item: any) => {
    const fresa = fresaMap.get(item.fresa_id)
    return {
      ordem: item.ordem,
      fresa_nome: fresa?.nome ?? item.fresa_id,
      fresa_sku: fresa?.sku ?? item.fresa_id,
      diametro_mm: fresa?.diametro_mm ?? null,
    }
  })
}

// ============================================================
// Protocolo de Fresagem (LEGADO - mantido para compatibilidade)
// ============================================================

export async function getProtocoloFresagem(implanteSku: string): Promise<CatalogoProtocoloFresagemFlat[]> {
  // 1. Busca osso_soft / osso_hard do implante
  const { data: impl } = await supabase
    .from("catalogo_implantes")
    .select("osso_soft, osso_hard")
    .eq("sku", implanteSku)
    .single()
  if (!impl) return []

  const protoIds = [impl.osso_soft, impl.osso_hard].filter(Boolean)
  if (protoIds.length === 0) return []

  // 2. Busca definições dos protocolos
  const { data: protocolos } = await supabase
    .from("catalogo_protocolos_fresagens")
    .select("id, nome, tipo_osso, sigla")
    .in("id", protoIds)
  if (!protocolos?.length) return []

  const protoMap = new Map(protocolos.map((p) => [p.id, p]))

  // 3. Busca fresas vinculadas aos protocolos
  const { data: itens } = await supabase
    .from("catalogo_protocolos_fresas_itens")
    .select("id, protocolo_id, fresa_id, ordem, created_at")
    .in("protocolo_id", protoIds)
    .order("ordem")
  if (!itens?.length) return []

  // 4. Busca fresas correspondentes (sem FK join)
  const fresaIds = [...new Set(itens.map((i: any) => i.fresa_id).filter(Boolean))]
  const { data: fresas } = fresaIds.length > 0
    ? await supabase.from("catalogo_fresas").select("*").in("sku", fresaIds)
    : { data: [] }
  const fresaMap = new Map((fresas ?? []).map((f: any) => [f.sku, f]))

  // 5. Achata no formato que FresagemTimeline espera
  return itens.map((item) => {
    const proto = protoMap.get(item.protocolo_id)
    const fresa = fresaMap.get(item.fresa_id)
    return {
      id: item.id,
      nome: proto?.nome ?? "",
      tipo_osso: proto?.tipo_osso ?? "",
      sigla: proto?.sigla ?? null,
      diametro_mm_aplicavel: null,
      ativo: true,
      created_at: item.created_at,
      updated_at: item.created_at,
      // campos flat usados pelo FresagemTimeline
      ordem_uso: item.ordem,
      fresa_sku: item.fresa_id,
      fresa: fresa ?? null,
    } as CatalogoProtocoloFresagemFlat
  })
}

export async function salvarProtocoloFresagem(implanteSku: string, protocolos: { fresa_sku: string; tipo_osso: string; ordem_uso: number }[]): Promise<void> {
  // 1. Busca osso_soft / osso_hard do implante para saber quais protocolos pertencem a ele
  const { data: impl } = await supabase
    .from("catalogo_implantes")
    .select("osso_soft, osso_hard")
    .eq("sku", implanteSku)
    .single()
  if (!impl) return

  const protoIds = [impl.osso_soft, impl.osso_hard].filter(Boolean)
  if (protoIds.length === 0) return

  // 2. Deleta apenas os itens dos protocolos deste implante
  const { data: existing } = await supabase
    .from("catalogo_protocolos_fresas_itens")
    .select("id")
    .in("protocolo_id", protoIds)
  if (existing?.length) {
    const ids = existing.map((e) => e.id)
    await supabase.from("catalogo_protocolos_fresas_itens").delete().in("id", ids)
  }

  if (protocolos.length === 0) return

  // 3. Busca protocolo_id baseado no tipo_osso (apenas os deste implante)
  const { data: protos } = await supabase
    .from("catalogo_protocolos_fresagens")
    .select("id, tipo_osso")
    .in("id", protoIds)
  const protoMap = new Map((protos ?? []).map((p) => [p.tipo_osso, p.id]))

  const rows = protocolos.map((p) => ({
    protocolo_id: protoMap.get(p.tipo_osso) ?? "",
    fresa_id: p.fresa_sku,
    ordem: p.ordem_uso,
  })).filter((r) => r.protocolo_id)
  if (rows.length === 0) return
  const { error } = await supabase.from("catalogo_protocolos_fresas_itens").insert(rows)
  if (error) throw error
}

export async function salvarImplanteChaves(implanteSku: string, chaveSkus: string[]): Promise<void> {
  await supabase.from("catalogo_implante_chaves").delete().eq("implante_sku", implanteSku)
  if (chaveSkus.length === 0) return
  const rows = chaveSkus.map((sku) => ({
    implante_sku: implanteSku,
    chave_id: sku,
  }))
  const { error } = await supabase.from("catalogo_implante_chaves").insert(rows)
  if (error) throw error
}

export async function listarImplanteChaves(implanteSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_chaves")
    .select("chave:catalogo_chaves(sku)")
    .eq("implante_sku", implanteSku)
  if (error) throw error
  return (data as unknown as { chave: { sku: string } | null }[] | null)
    ?.map((r) => r.chave?.sku)
    .filter(Boolean) as string[] ?? []
}

// ============================================================
// Kits do Implante (N:M)
// ============================================================

export async function salvarImplanteKits(implanteSku: string, kitSkus: string[]): Promise<void> {
  await supabase.from("catalogo_implante_kit").delete().eq("implante_sku", implanteSku)
  if (kitSkus.length === 0) return
  const rows = kitSkus.map((kitSku) => ({ implante_sku: implanteSku, kit_sku: kitSku }))
  const { error } = await supabase.from("catalogo_implante_kit").insert(rows)
  if (error) throw error
}

export async function listarImplanteKits(implanteSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_kit")
    .select("kit_sku")
    .eq("implante_sku", implanteSku)
  if (error) throw error
  return (data as { kit_sku: string }[]).map((r) => r.kit_sku)
}

// ============================================================
// Abutments do Implante (N:M)
// ============================================================

export async function salvarImplanteAbutments(implanteSku: string, abutmentSkus: string[]): Promise<void> {
  await supabase.from("catalogo_implante_abutment").delete().eq("implante_sku", implanteSku)
  if (abutmentSkus.length === 0) return
  const rows = abutmentSkus.map((abutmentSku) => ({ implante_sku: implanteSku, abutment_sku: abutmentSku }))
  const { error } = await supabase.from("catalogo_implante_abutment").insert(rows)
  if (error) throw error
}

export async function listarImplanteAbutments(implanteSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_abutment")
    .select("abutment_sku")
    .eq("implante_sku", implanteSku)
  if (error) throw error
  return (data as { abutment_sku: string }[]).map((r) => r.abutment_sku)
}

// ============================================================
// Cicatrizadores do Implante (via FK implante_id)
// ============================================================

export async function listarImplanteCicatrizadores(implanteSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_cicatrizadores")
    .select("sku")
    .eq("implante_id", implanteSku)
  if (error) throw error
  return (data as { sku: string }[]).map((r) => r.sku)
}

export async function salvarImplanteCicatrizadores(implanteSku: string, cicatrizadorSkus: string[]): Promise<void> {
  // Limpar vinculações anteriores deste implante
  await supabase.from("catalogo_cicatrizadores").update({ implante_id: null }).eq("implante_id", implanteSku)
  if (cicatrizadorSkus.length === 0) return
  // Vincular novos cicatrizadores
  for (const sku of cicatrizadorSkus) {
    await supabase.from("catalogo_cicatrizadores").update({ implante_id: implanteSku }).eq("sku", sku)
  }
}

// ============================================================
// Dados Relacionados ao Implante
// ============================================================

/** Lista chaves completas vinculadas ao implante (via pivot catalogo_implante_chaves) */
export async function listarChavesDoImplante(implanteSku: string): Promise<CatalogoChave[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_chaves")
    .select("chave_id, chave:catalogo_chaves(*, tipo_chave:catalogo_tipos_chaves(*))")
    .eq("implante_sku", implanteSku)
  if (error) throw error
  return (data as unknown as { chave: CatalogoChave }[]).map((r) => r.chave).filter(Boolean)
}

/** Lista cicatrizadores que referenciam este implante (FK implante_id) */
export async function listarCicatrizadoresDoImplante(implanteSku: string): Promise<CatalogoCicatrizador[]> {
  const { data, error } = await supabase
    .from("catalogo_cicatrizadores")
    .select("*, implante:catalogo_implantes(*), chave:catalogo_chaves(*)")
    .eq("implante_id", implanteSku)
    .eq("ativo", true)
    .order("nome")
  if (error) throw error
  return data as CatalogoCicatrizador[]
}

/** Lista abutments da mesma família (familia_id) */
export async function listarAbutmentsDaFamilia(familiaId: string): Promise<CatalogoAbutment[]> {
  const { data, error } = await supabase
    .from("catalogo_abutments")
    .select("*, tipo_abutment:catalogo_cps_tipos_abutments(*), familia:catalogo_ips_familias(*), parafuso:catalogo_parafusos!fk_abutments_parafuso(*), chave:catalogo_chaves!fk_abutments_chave(*)")
    .eq("familia_id", familiaId)
    .order("sku")
  if (error) throw error
  return data as CatalogoAbutment[]
}

/** Lista abutments vinculados ao implante via pivot catalogo_implante_abutment */
export async function listarAbutmentsDoImplante(implanteSku: string): Promise<CatalogoAbutment[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_abutment")
    .select("abutment:catalogo_abutments(*, tipo_abutment:catalogo_cps_tipos_abutments(*), familia:catalogo_ips_familias(*), parafuso:catalogo_parafusos!fk_abutments_parafuso(*), chave:catalogo_chaves!fk_abutments_chave(*))")
    .eq("implante_sku", implanteSku)
  if (error) throw error
  return (data as unknown as { abutment: CatalogoAbutment }[]).map((r) => r.abutment).filter(Boolean)
}

/** Lista kits vinculados ao implante via pivot catalogo_implante_kit */
export async function listarKitsDoImplante(implanteSku: string): Promise<CatalogoKit[]> {
  const { data, error } = await supabase
    .from("catalogo_implante_kit")
    .select("kit:catalogo_kits(*, tipo_kit:catalogo_tipos_kits(*))")
    .eq("implante_sku", implanteSku)
  if (error) throw error
  return (data as unknown as { kit: CatalogoKit }[]).map((r) => r.kit).filter(Boolean)
}


/** Lista kits que compartilham chaves com este implante */
export async function listarKitsComChavesEmComum(implanteSku: string): Promise<CatalogoKit[]> {
  // 1. Busca SKUs das chaves do implante via join
  const { data: kc } = await supabase
    .from("catalogo_implante_chaves")
    .select("chave:catalogo_chaves(sku)")
    .eq("implante_sku", implanteSku)
  const chaveSkus = (kc as { chave: { sku: string } | null }[] | null)?.map((r) => r.chave?.sku).filter(Boolean) as string[] ?? []
  if (chaveSkus.length === 0) return []

  // 2. Busca kits que têm pelo menos uma dessas chaves
  const { data: kk } = await supabase
    .from("catalogo_kit_chaves")
    .select("kit_sku")
    .in("chave_id", chaveSkus)
  const kitSkus = [...new Set((kk as { kit_sku: string }[] | null)?.map((r) => r.kit_sku) ?? [])]
  if (kitSkus.length === 0) return []

  // 3. Retorna kits completos
  const { data, error } = await supabase
    .from("catalogo_kits")
    .select("*, tipo_kit:catalogo_tipos_kits(*)")
    .in("sku", kitSkus)
    .eq("ativo", true)
  if (error) throw error
  return data as CatalogoKit[]
}

// ============================================================
// Fresas
// ============================================================

export async function listarFresas(): Promise<CatalogoFresa[]> {
  const { data, error } = await supabase
    .from("catalogo_fresas")
    .select("*, tipo_fresa:catalogo_tipos_fresas(*)")
    .order("nome")
  if (error) throw error
  return data as CatalogoFresa[]
}

export async function criarFresa(input: {
  sku: string; nome: string; tipo_fresa_id?: string
  sigla?: string; descricao?: string; tipo?: string
  comprimento?: string; diametro_mm?: number; material?: string; preco?: number
  preco_euro?: number; preco_dolar?: number; qtd_disponivel?: number; qtd_minima_aviso?: number
}): Promise<CatalogoFresa> {
  const { data, error } = await supabase
    .from("catalogo_fresas")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoFresa
}

export async function atualizarFresa(sku: string, input: Partial<{
  nome: string; tipo_fresa_id: string; sigla: string; descricao: string
  tipo: string; comprimento: string; diametro_mm: number; material: string
  preco: number; preco_euro: number; preco_dolar: number
  qtd_disponivel: number; qtd_minima_aviso: number; ativo: boolean
}>): Promise<CatalogoFresa> {
  const { data, error } = await supabase
    .from("catalogo_fresas")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoFresa
}

export async function toggleFresaAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_fresas").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerFresa(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_fresas").delete().eq("sku", sku)
  if (error) throw error
}

export async function listarImplantesParaKit(): Promise<{ sku: string; nome: string; diametro_mm: number | null; conexao_id: string | null; familia_id: string | null; linha_id: string | null; conexao: { nome: string } | null; familia: { nome: string } | null; linha: { nome: string } | null }[]> {
  const { data, error } = await supabase
    .from("catalogo_implantes")
    .select("sku, nome, diametro_mm, conexao_id, familia_id, linha_id, conexao:catalogo_ips_conexoes!inner(nome), familia:catalogo_ips_familias!inner(nome), linha:catalogo_ips_linhas!inner(nome)")
    .eq("ativo", true)
    .order("sku")
  if (error) throw error
  return data as any[]
}
