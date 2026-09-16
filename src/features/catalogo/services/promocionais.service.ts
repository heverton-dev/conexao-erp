import { supabase } from "~/core/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"
import type { CatalogoPromocional } from "../types"

const MODULO_KEY = "catalogo"

const TABELA_POR_TIPO_ITEM: Record<string, string> = {
  implante: "catalogo_implantes",
  abutment: "catalogo_abutments",
  kit: "catalogo_kits",
  parafuso: "catalogo_parafusos",
  cicatrizador: "catalogo_cicatrizadores",
  chave: "catalogo_chaves",
  fresa: "catalogo_fresas",
  complementar: "catalogo_complementares",
  opcional: "catalogo_opcionais",
  componente: "catalogo_componentes",
  acessorio: "catalogo_acessorios",
  instrumental: "catalogo_instrumentais_gerais",
}

/**
 * Busca o registro completo do produto real por trás de um item de pacote
 * promocional (a tabela catalogo_promocional_itens só guarda sku+tipo).
 * Usado para enriquecer a Ficha Técnica com specs reais (sem preço — item de
 * pacote fechado não é vendido separadamente).
 */
export async function listarItensPromocionalDetalhado(
  tipo: string,
  skus: string[],
): Promise<Map<string, Record<string, unknown>>> {
  const tabela = TABELA_POR_TIPO_ITEM[tipo]
  const map = new Map<string, Record<string, unknown>>()
  if (!tabela || skus.length === 0) return map

  const { data, error } = await supabase.from(tabela).select("*").in("sku", skus)
  if (error) throw error

  for (const row of (data ?? []) as Record<string, unknown>[]) {
    map.set(row.sku as string, row)
  }
  return map
}

export async function listarPromocionais(): Promise<CatalogoPromocional[]> {
  const { data, error } = await supabase
    .from("catalogo_promocionais")
    .select("*, itens:catalogo_promocional_itens(*)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as CatalogoPromocional[]
}

export async function listarPromocionaisAtivos(): Promise<CatalogoPromocional[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("catalogo_promocionais")
    .select("*, itens:catalogo_promocional_itens(*)")
    .eq("ativo", true)
    .or(`expira_em.is.null,expira_em.gt.${now}`)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as CatalogoPromocional[]
}

export async function getPromocionalDetalhe(id: string): Promise<CatalogoPromocional | null> {
  const { data, error } = await supabase
    .from("catalogo_promocionais")
    .select("*, itens:catalogo_promocional_itens(*)")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as CatalogoPromocional
}

export async function criarPromocional(input: {
  nome: string
  descricao?: string
  preco: number
  preco_euro?: number
  preco_dolar?: number
  qtd_disponivel?: number
  qtd_minima_aviso?: number
  expira_em?: string
  itens?: { sku: string; tipo: string }[]
}): Promise<CatalogoPromocional> {
  const { itens, ...promoData } = input
  const { data, error } = await supabase
    .from("catalogo_promocionais")
    .insert({ ...promoData })
    .select()
    .single()
  if (error) throw error

  if (itens?.length) {
    const rows = itens.map((item) => ({ promocional_id: data.id, ...item }))
    await supabase.from("catalogo_promocional_itens").insert(rows)
  }

  dispararEventoModulo(MODULO_KEY, "promocional.criado", { promocional_id: data.id, nome: data.nome }).catch(() => {})
  return data as CatalogoPromocional
}

export async function atualizarPromocional(id: string, input: Partial<{
  nome: string
  descricao: string
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  expira_em: string
  ativo: boolean
  itens: { sku: string; tipo: string }[]
}>): Promise<CatalogoPromocional> {
  const { itens, ...promoData } = input
  const { data, error } = await supabase
    .from("catalogo_promocionais")
    .update(promoData)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  if (itens !== undefined) {
    await supabase.from("catalogo_promocional_itens").delete().eq("promocional_id", id)
    if (itens.length) {
      const rows = itens.map((item) => ({ promocional_id: id, ...item }))
      await supabase.from("catalogo_promocional_itens").insert(rows)
    }
  }

  return data as CatalogoPromocional
}

export async function removerPromocional(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_promocionais").delete().eq("id", id)
  if (error) throw error
}
