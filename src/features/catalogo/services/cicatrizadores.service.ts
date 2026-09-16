import { supabase } from "~/core/supabase"
import type { CatalogoCicatrizador } from "../types"

export async function listarCicatrizadores(): Promise<CatalogoCicatrizador[]> {
  const { data, error } = await supabase
    .from("catalogo_cicatrizadores")
    .select("*, implante:catalogo_implantes(*), chave:catalogo_chaves(*)")
    .order("nome")
  if (error) throw error
  return data as CatalogoCicatrizador[]
}

export async function criarCicatrizador(input: {
  sku: string; nome: string
  implante_id?: string; chave_id?: string
  sigla?: string; descricao?: string
  diametro_plataforma_mm?: number; altura_transmucoso_mm?: number
  altura_corpo_mm?: number; torque_ncm?: number; material?: string
  preco?: number
}): Promise<CatalogoCicatrizador> {
  const { data, error } = await supabase
    .from("catalogo_cicatrizadores")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCicatrizador
}

export async function atualizarCicatrizador(sku: string, input: Partial<{
  nome: string; implante_id: string; chave_id: string
  sigla: string; descricao: string
  diametro_plataforma_mm: number; altura_transmucoso_mm: number
  altura_corpo_mm: number; torque_ncm: number; material: string
  preco: number; ativo: boolean
}>): Promise<CatalogoCicatrizador> {
  const { data, error } = await supabase
    .from("catalogo_cicatrizadores")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCicatrizador
}

export async function toggleCicatrizadorAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cicatrizadores").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerCicatrizador(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cicatrizadores").delete().eq("sku", sku)
  if (error) throw error
}
