import { supabase } from "~/core/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"
import type { CatalogoKit, CatalogoTipoKit, CatalogoChave, CatalogoFresa, CatalogoComplementar, CatalogoOpcional } from "../types"

const MODULO_KEY = "catalogo"

// ============================================================
// Tipos de Kit
// ============================================================

export async function listarTiposKit(): Promise<CatalogoTipoKit[]> {
  const { data, error } = await supabase
    .from("catalogo_tipos_kits")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoTipoKit[]
}

export async function criarTipoKit(input: { nome: string; sigla?: string }): Promise<CatalogoTipoKit> {
  const { data, error } = await supabase
    .from("catalogo_tipos_kits")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoTipoKit
}

export async function toggleTipoKitAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_tipos_kits").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function atualizarTipoKit(id: string, input: { nome: string; sigla?: string; ativo: boolean }): Promise<CatalogoTipoKit> {
  const { data, error } = await supabase
    .from("catalogo_tipos_kits")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoTipoKit
}

export async function removerTipoKit(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_tipos_kits").delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Kits
// ============================================================

export async function listarKitsAtivos(): Promise<CatalogoKit[]> {
  const { data, error } = await supabase
    .from("catalogo_kits")
    .select("*, tipo_kit:catalogo_tipos_kits(*)")
    .eq("ativo", true)
    .order("nome")
  if (error) throw error
  return data as CatalogoKit[]
}

export async function listarTodosKits(): Promise<CatalogoKit[]> {
  const { data, error } = await supabase
    .from("catalogo_kits")
    .select("*, tipo_kit:catalogo_tipos_kits(*)")
    .order("nome")
  if (error) throw error
  return data as CatalogoKit[]
}

export async function getKitDetalhe(sku: string): Promise<CatalogoKit | null> {
  const { data, error } = await supabase
    .from("catalogo_kits")
    .select("*, tipo_kit:catalogo_tipos_kits(*)")
    .eq("sku", sku)
    .single()
  if (error) throw error

  if (!data) return null

  // Carregar composição N:M (contar quantidades via duplicatas nas pivots)
  const [chavesRes, fresasRes, compRes, opcRes] = await Promise.all([
    supabase.from("catalogo_kit_chaves").select("chave_id").eq("kit_sku", sku),
    supabase.from("catalogo_kit_fresas").select("fresa_id").eq("kit_sku", sku),
    supabase.from("catalogo_kit_complementares").select("complementar_id").eq("kit_sku", sku),
    supabase.from("catalogo_kit_opcionais").select("opcional_id").eq("kit_sku", sku),
  ])

  // Contar quantidades por SKU (duplicatas = quantidade)
  const countByField = (rows: Record<string, unknown>[] | null, field: string) => {
    const map = new Map<string, number>()
    for (const r of rows ?? []) {
      const id = String(r[field])
      map.set(id, (map.get(id) ?? 0) + 1)
    }
    return map
  }

  const chavesQty = countByField(chavesRes.data, "chave_id")
  const fresasQty = countByField(fresasRes.data, "fresa_id")
  const compQty = countByField(compRes.data, "complementar_id")
  const opcQty = countByField(opcRes.data, "opcional_id")

  const uniqueChaves = [...chavesQty.keys()]
  const uniqueFresas = [...fresasQty.keys()]
  const uniqueComps = [...compQty.keys()]
  const uniqueOpcs = [...opcQty.keys()]

  const [chavesData, fresasData, compData, opcData] = await Promise.all([
    uniqueChaves.length > 0 ? supabase.from("catalogo_chaves").select("*").in("sku", uniqueChaves).then((r) => r.data ?? []) : Promise.resolve([]),
    uniqueFresas.length > 0 ? supabase.from("catalogo_fresas").select("*").in("sku", uniqueFresas).then((r) => r.data ?? []) : Promise.resolve([]),
    uniqueComps.length > 0 ? supabase.from("catalogo_complementares").select("*").in("sku", uniqueComps).then((r) => r.data ?? []) : Promise.resolve([]),
    uniqueOpcs.length > 0 ? supabase.from("catalogo_opcionais").select("*").in("sku", uniqueOpcs).then((r) => r.data ?? []) : Promise.resolve([]),
  ])

  const kit = data as CatalogoKit & { _quantidades?: Record<string, number> }
  kit.chaves = chavesData as CatalogoChave[]
  kit.fresas = fresasData as CatalogoFresa[]
  kit.complementares = compData as CatalogoComplementar[]
  kit.opcionais = opcData as CatalogoOpcional[]

  // Guardar quantidades para uso externo
  kit._quantidades = {}
  for (const [sku, qty] of chavesQty) kit._quantidades[sku] = qty
  for (const [sku, qty] of fresasQty) kit._quantidades[sku] = qty
  for (const [sku, qty] of compQty) kit._quantidades[sku] = qty
  for (const [sku, qty] of opcQty) kit._quantidades[sku] = qty

  return kit
}

export async function criarKit(input: {
  sku: string; tipo_kit_id?: string; nome: string
  sigla?: string; descricao?: string; preco?: number
  preco_euro?: number; preco_dolar?: number
  qtd_disponivel?: number; qtd_minima_aviso?: number
}): Promise<CatalogoKit> {
  const { data, error } = await supabase
    .from("catalogo_kits")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.criado", { sku: data.sku, tipo: "kit" }).catch(() => {})
  return data as CatalogoKit
}

export async function atualizarKit(sku: string, input: Partial<{
  nome: string; tipo_kit_id: string; sigla: string; descricao: string; preco: number; ativo: boolean
  preco_euro: number; preco_dolar: number
  qtd_disponivel: number; qtd_minima_aviso: number
}>): Promise<CatalogoKit> {
  const { data, error } = await supabase
    .from("catalogo_kits")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoKit
}
export async function removerKit(sku: string): Promise<void> {
  // Remover composição N:M (sem FK/CASCADE nessas pivots)
  await Promise.all([
    supabase.from("catalogo_kit_chaves").delete().eq("kit_sku", sku),
    supabase.from("catalogo_kit_fresas").delete().eq("kit_sku", sku),
    supabase.from("catalogo_kit_complementares").delete().eq("kit_sku", sku),
    supabase.from("catalogo_kit_opcionais").delete().eq("kit_sku", sku),
    supabase.from("catalogo_kit_implantes").delete().eq("kit_sku", sku),
    supabase.from("catalogo_implante_kit").delete().eq("kit_sku", sku),
    supabase.from("catalogo_kit_kits_complementares").delete().eq("kit_sku", sku),
    supabase.from("catalogo_kit_kits_relacionados").delete().eq("kit_sku", sku),
  ])
  const { error } = await supabase.from("catalogo_kits").delete().eq("sku", sku)
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.removido", { sku, tipo: "kit" }).catch(() => {})
}
export async function toggleKitAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_kits").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

// ============================================================
// Composição N:M do Kit
// ============================================================

export async function listarKitChaves(kitSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_chaves").select("chave_id").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { chave_id: string }[]).map((r) => r.chave_id)
}

export async function salvarKitChaves(kitSku: string, chaveIds: string[]): Promise<void> {
  await supabase.from("catalogo_kit_chaves").delete().eq("kit_sku", kitSku)
  if (chaveIds.length === 0) return
  const rows = chaveIds.map((id) => ({ kit_sku: kitSku, chave_id: id }))
  const { error } = await supabase.from("catalogo_kit_chaves").insert(rows)
  if (error) throw error
}

export async function listarKitFresas(kitSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_fresas").select("fresa_id").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { fresa_id: string }[]).map((r) => r.fresa_id)
}

export async function salvarKitFresas(kitSku: string, fresaIds: string[]): Promise<void> {
  await supabase.from("catalogo_kit_fresas").delete().eq("kit_sku", kitSku)
  if (fresaIds.length === 0) return
  const rows = fresaIds.map((id) => ({ kit_sku: kitSku, fresa_id: id }))
  const { error } = await supabase.from("catalogo_kit_fresas").insert(rows)
  if (error) throw error
}

export async function listarKitsDeChave(chaveSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_chaves").select("kit_sku").eq("chave_id", chaveSku)
  if (error) throw error
  return (data as { kit_sku: string }[]).map((r) => r.kit_sku)
}

export async function salvarKitsDeChave(chaveSku: string, kitSkus: string[]): Promise<void> {
  await supabase.from("catalogo_kit_chaves").delete().eq("chave_id", chaveSku)
  if (kitSkus.length === 0) return
  const rows = kitSkus.map((sku) => ({ kit_sku: sku, chave_id: chaveSku }))
  const { error } = await supabase.from("catalogo_kit_chaves").insert(rows)
  if (error) throw error
}

export async function listarKitsDeFresa(fresaSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_fresas").select("kit_sku").eq("fresa_id", fresaSku)
  if (error) throw error
  return (data as { kit_sku: string }[]).map((r) => r.kit_sku)
}

export async function salvarKitsDeFresa(fresaSku: string, kitSkus: string[]): Promise<void> {
  await supabase.from("catalogo_kit_fresas").delete().eq("fresa_id", fresaSku)
  if (kitSkus.length === 0) return
  const rows = kitSkus.map((sku) => ({ kit_sku: sku, fresa_id: fresaSku }))
  const { error } = await supabase.from("catalogo_kit_fresas").insert(rows)
  if (error) throw error
}

export async function listarKitsDeCicatrizador(cicatrizadorSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_cicatrizadores").select("kit_sku").eq("cicatrizador_sku", cicatrizadorSku)
  if (error) throw error
  return (data as { kit_sku: string }[]).map((r) => r.kit_sku)
}

export async function salvarKitsDeCicatrizador(cicatrizadorSku: string, kitSkus: string[]): Promise<void> {
  await supabase.from("catalogo_kit_cicatrizadores").delete().eq("cicatrizador_sku", cicatrizadorSku)
  if (kitSkus.length === 0) return
  const rows = kitSkus.map((sku) => ({ kit_sku: sku, cicatrizador_sku: cicatrizadorSku }))
  const { error } = await supabase.from("catalogo_kit_cicatrizadores").insert(rows)
  if (error) throw error
}

interface KitResumo { sku: string; nome: string; preco: number | null }

export async function listarKitsRelacionadosDeChave(chaveSku: string): Promise<KitResumo[]> {
  const { data, error } = await supabase.from("catalogo_kit_chaves").select("kit:catalogo_kits(sku, nome, preco)").eq("chave_id", chaveSku)
  if (error) throw error
  return (data as unknown as { kit: KitResumo }[]).map((r) => r.kit).filter(Boolean)
}

export async function listarKitsRelacionadosDeFresa(fresaSku: string): Promise<KitResumo[]> {
  const { data, error } = await supabase.from("catalogo_kit_fresas").select("kit:catalogo_kits(sku, nome, preco)").eq("fresa_id", fresaSku)
  if (error) throw error
  return (data as unknown as { kit: KitResumo }[]).map((r) => r.kit).filter(Boolean)
}

export async function listarKitsRelacionadosDeCicatrizador(cicatrizadorSku: string): Promise<KitResumo[]> {
  const { data, error } = await supabase.from("catalogo_kit_cicatrizadores").select("kit:catalogo_kits(sku, nome, preco)").eq("cicatrizador_sku", cicatrizadorSku)
  if (error) throw error
  return (data as unknown as { kit: KitResumo }[]).map((r) => r.kit).filter(Boolean)
}

export async function listarKitComplementares(kitSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_complementares").select("complementar_id").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { complementar_id: string }[]).map((r) => r.complementar_id)
}

export async function salvarKitComplementares(kitSku: string, complementarIds: string[]): Promise<void> {
  await supabase.from("catalogo_kit_complementares").delete().eq("kit_sku", kitSku)
  if (complementarIds.length === 0) return
  const rows = complementarIds.map((id) => ({ kit_sku: kitSku, complementar_id: id }))
  const { error } = await supabase.from("catalogo_kit_complementares").insert(rows)
  if (error) throw error
}

export async function listarKitOpcionais(kitSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_opcionais").select("opcional_id").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { opcional_id: string }[]).map((r) => r.opcional_id)
}

export async function salvarKitOpcionais(kitSku: string, opcionalIds: string[]): Promise<void> {
  await supabase.from("catalogo_kit_opcionais").delete().eq("kit_sku", kitSku)
  if (opcionalIds.length === 0) return
  const rows = opcionalIds.map((id) => ({ kit_sku: kitSku, opcional_id: id }))
  const { error } = await supabase.from("catalogo_kit_opcionais").insert(rows)
  if (error) throw error
}

export async function listarKitKitsComplementares(kitSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_kits_complementares").select("complementar_sku").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { complementar_sku: string }[]).map((r) => r.complementar_sku)
}

export async function salvarKitKitsComplementares(kitSku: string, complementarSkus: string[]): Promise<void> {
  await supabase.from("catalogo_kit_kits_complementares").delete().eq("kit_sku", kitSku)
  if (complementarSkus.length === 0) return
  const rows = complementarSkus.map((sku) => ({ kit_sku: kitSku, complementar_sku: sku }))
  const { error } = await supabase.from("catalogo_kit_kits_complementares").insert(rows)
  if (error) throw error
}

export async function listarKitKitsRelacionados(kitSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_kits_relacionados").select("relacionado_sku").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { relacionado_sku: string }[]).map((r) => r.relacionado_sku)
}

export async function salvarKitKitsRelacionados(kitSku: string, relacionadoSkus: string[]): Promise<void> {
  await supabase.from("catalogo_kit_kits_relacionados").delete().eq("kit_sku", kitSku)
  if (relacionadoSkus.length === 0) return
  const rows = relacionadoSkus.map((sku) => ({ kit_sku: kitSku, relacionado_sku: sku }))
  const { error } = await supabase.from("catalogo_kit_kits_relacionados").insert(rows)
  if (error) throw error
}

export async function listarKitImplantes(kitSku: string): Promise<string[]> {
  const { data, error } = await supabase.from("catalogo_kit_implantes").select("implante_sku").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { implante_sku: string }[]).map((r) => r.implante_sku)
}

export async function salvarKitImplantes(kitSku: string, implanteSkus: string[]): Promise<void> {
  await supabase.from("catalogo_kit_implantes").delete().eq("kit_sku", kitSku)
  if (implanteSkus.length === 0) return
  const rows = implanteSkus.map((sku) => ({ kit_sku: kitSku, implante_sku: sku }))
  const { error } = await supabase.from("catalogo_kit_implantes").insert(rows)
  if (error) throw error
}

export async function listarKitImplantesDetalhe(kitSku: string): Promise<{ implante_sku: string; todos_diametros: boolean }[]> {
  const { data, error } = await supabase.from("catalogo_kit_implantes").select("implante_sku, todos_diametros").eq("kit_sku", kitSku)
  if (error) throw error
  return (data as { implante_sku: string; todos_diametros: boolean }[]) ?? []
}

export async function salvarKitImplantesDetalhado(kitSku: string, data: { implante_sku: string; todos_diametros: boolean }[]): Promise<void> {
  await supabase.from("catalogo_kit_implantes").delete().eq("kit_sku", kitSku)
  if (data.length === 0) return
  const rows = data.map((d) => ({ kit_sku: kitSku, ...d }))
  const { error } = await supabase.from("catalogo_kit_implantes").insert(rows)
  if (error) throw error
}

// ============================================================
// Backward-compatible aliases
// ============================================================

/** @deprecated Use toggleTipoKitAtivo */
export const toggleCategoriaKitAtivo = toggleTipoKitAtivo
/** @deprecated Use listarTiposKit */
export const listarCategoriasKit = listarTiposKit
/** @deprecated Use criarTipoKit */
export const criarCategoriaKit = criarTipoKit

/** @deprecated BOM replaced by N:M pivot tables. Use salvarKitChaves/Fresas/Complementares/Opcionais */
export async function adicionarBOMItem(): Promise<void> {
  console.warn("adicionarBOMItem is deprecated. Use N:M pivot tables instead.")
}
