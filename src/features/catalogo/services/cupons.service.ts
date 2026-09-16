import { supabase } from "~/core/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"
import type { CatalogoCupom } from "../types"

const MODULO_KEY = "catalogo"

export async function listarCupons(): Promise<CatalogoCupom[]> {
  const { data, error } = await supabase
    .from("catalogo_cupons")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as CatalogoCupom[]
}

export async function criarCupom(input: {
  codigo: string
  tipo: "percentual" | "fixo"
  valor: number
  validade?: string
  grupo_id?: string | null
}): Promise<CatalogoCupom> {
  const { data, error } = await supabase
    .from("catalogo_cupons")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCupom
}

export async function atualizarCupom(id: string, input: Partial<{ codigo: string; tipo: string; valor: number; validade: string; ativo: boolean; grupo_id: string | null }>): Promise<CatalogoCupom> {
  const { data, error } = await supabase
    .from("catalogo_cupons")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCupom
}

export async function removerCupom(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cupons").delete().eq("id", id)
  if (error) throw error
}

/**
 * Valida um cupom. Se o cupom for restrito a um grupo (grupo_id preenchido),
 * só é aceito para cliente pertencente àquele grupo — cupom sem grupo_id é global.
 */
export async function validarCupom(codigo: string, clienteId?: string | null): Promise<CatalogoCupom | null> {
  const { data, error } = await supabase
    .from("catalogo_cupons")
    .select("*")
    .eq("codigo", codigo.toUpperCase())
    .eq("ativo", true)
    .single()
  if (error || !data) return null
  if (data.validade && new Date(data.validade) < new Date()) return null

  if (data.grupo_id) {
    if (!clienteId) return null
    const { data: cliente } = await supabase
      .from("catalogo_clientes")
      .select("grupo_id")
      .eq("id", clienteId)
      .single()
    if (cliente?.grupo_id !== data.grupo_id) return null
  }

  dispararEventoModulo(MODULO_KEY, "cupom.utilizado", { cupom_id: data.id, codigo }).catch(() => {})
  return data as CatalogoCupom
}

export function aplicarCupom(subtotal: number, cupom: CatalogoCupom): number {
  if (cupom.tipo === "percentual") return subtotal * (1 - cupom.valor / 100)
  return Math.max(0, subtotal - cupom.valor)
}
