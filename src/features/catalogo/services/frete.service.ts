import { supabase } from "~/core/supabase"
import type { CatalogoFrete } from "../types"

export async function listarFretes(): Promise<CatalogoFrete[]> {
  const { data, error } = await supabase
    .from("catalogo_fretes")
    .select("*")
    .order("cep_inicio")
  if (error) throw error
  return data as CatalogoFrete[]
}

export async function criarFrete(input: {
  cep_inicio: string
  cep_fim: string
  valor: number
  prazo_dias: number
}): Promise<CatalogoFrete> {
  const { data, error } = await supabase
    .from("catalogo_fretes")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoFrete
}

export async function atualizarFrete(id: string, input: Partial<{ cep_inicio: string; cep_fim: string; valor: number; prazo_dias: number }>): Promise<CatalogoFrete> {
  const { data, error } = await supabase
    .from("catalogo_fretes")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoFrete
}

export async function removerFrete(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_fretes").delete().eq("id", id)
  if (error) throw error
}

export async function consultarFrete(cep: string): Promise<CatalogoFrete | null> {
  const cepNum = cep.replace(/\D/g, "")
  const { data, error } = await supabase
    .from("catalogo_fretes")
    .select("*")
    .lte("cep_inicio", cepNum)
    .gte("cep_fim", cepNum)
    .limit(1)
    .single()
  if (error || !data) return null
  return data as CatalogoFrete
}

export async function consultarViaCEP(cep: string): Promise<{ logradouro: string; bairro: string; cidade: string; estado: string } | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return { logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }
  } catch {
    return null
  }
}
