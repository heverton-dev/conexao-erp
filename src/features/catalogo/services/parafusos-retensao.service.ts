import { supabase } from "~/core/supabase"
import type { CatalogoParafusoRetencao } from "../types"

export async function listarParafusosRetensao(): Promise<CatalogoParafusoRetencao[]> {
  const { data, error } = await supabase
    .from("catalogo_parafusos_retensao")
    .select("*, chave:catalogo_chaves_ferramental(*)")
    .order("nome")
  if (error) throw error
  return data as CatalogoParafusoRetencao[]
}

export async function criarParafusoRetencao(input: {
  sku: string
  nome: string
  torque_ncm?: number
  vinculo_tipo: "abutment" | "componente"
  vinculo_sku: string
  chave_sku?: string
  preco?: number
}): Promise<CatalogoParafusoRetencao> {
  const { data, error } = await supabase
    .from("catalogo_parafusos_retensao")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoParafusoRetencao
}

export async function atualizarParafusoRetencao(sku: string, input: Partial<{
  nome: string
  torque_ncm: number
  vinculo_tipo: "abutment" | "componente"
  vinculo_sku: string
  chave_sku: string
  preco: number
}>): Promise<CatalogoParafusoRetencao> {
  const { data, error } = await supabase
    .from("catalogo_parafusos_retensao")
    .update(input)
    .eq("sku", sku)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoParafusoRetencao
}

export async function toggleParafusoRetencaoAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase
    .from("catalogo_parafusos_retensao")
    .update({ ativo })
    .eq("sku", sku)
  if (error) throw error
}

export async function removerParafusoRetencao(sku: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_parafusos_retensao")
    .delete()
    .eq("sku", sku)
  if (error) throw error
}
