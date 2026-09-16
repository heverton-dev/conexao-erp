import { supabase } from "~/core/supabase"
import type {
  CatalogoAcessorio, CatalogoCategoriaAcessorio, CatalogoChave,
  CatalogoAcessorioFerramental, CatalogoCategoriaInstrumental, CatalogoInstrumentalGeral,
} from "../types"

// Categorias de Acessório
export async function listarCategoriasAcessorio(): Promise<CatalogoCategoriaAcessorio[]> {
  const { data, error } = await supabase
    .from("catalogo_categorias_acessorio")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoCategoriaAcessorio[]
}

export async function criarCategoriaAcessorio(nome: string): Promise<CatalogoCategoriaAcessorio> {
  const { data, error } = await supabase
    .from("catalogo_categorias_acessorio")
    .insert({ nome })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCategoriaAcessorio
}

export async function toggleCategoriaAcessorioAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_categorias_acessorio").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerCategoriaAcessorio(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_categorias_acessorio").delete().eq("id", id)
  if (error) throw error
}

// Acessórios
export async function listarAcessorios(categoriaId?: string): Promise<CatalogoAcessorio[]> {
  let query = supabase
    .from("catalogo_acessorios")
    .select("*, categoria:catalogo_categorias_acessorio(*)")
    .order("nome")
  if (categoriaId) query = query.eq("categoria_id", categoriaId)
  const { data, error } = await query
  if (error) throw error
  return data as CatalogoAcessorio[]
}

export async function getAcessorioDetalhe(sku: string): Promise<CatalogoAcessorio | null> {
  const { data, error } = await supabase
    .from("catalogo_acessorios")
    .select("*, categoria:catalogo_categorias_acessorio(*)")
    .eq("sku", sku)
    .single()
  if (error) throw error
  return data as CatalogoAcessorio
}

export async function criarAcessorio(input: {
  sku: string
  categoria_id: string
  nome: string
  diametro_mm?: number
  altura_mm?: number
  caracteristicas?: Record<string, unknown>
}): Promise<CatalogoAcessorio> {
  const { data, error } = await supabase
    .from("catalogo_acessorios")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoAcessorio
}

export async function toggleAcessorioAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_acessorios").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerAcessorio(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_acessorios").delete().eq("sku", sku)
  if (error) throw error
}

// Chaves Ferramentais
export async function listarChavesFerramental(): Promise<CatalogoChave[]> {
  const { data, error } = await supabase
    .from("catalogo_chaves_ferramental")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoChave[]
}

export async function criarChaveFerramental(input: { sku: string; nome: string; tipo_ferramenta: string }): Promise<CatalogoChave> {
  const { data, error } = await supabase
    .from("catalogo_chaves_ferramental")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoChave
}

export async function toggleChaveFerramentalAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_chaves_ferramental").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerChaveFerramental(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_chaves_ferramental").delete().eq("sku", sku)
  if (error) throw error
}

// Acessório × Ferramental
export async function getFerramentasObrigatorias(acessorioSku: string): Promise<CatalogoAcessorioFerramental[]> {
  const { data, error } = await supabase
    .from("catalogo_acessorio_ferramental")
    .select("*, ferramenta:catalogo_chaves_ferramental(*)")
    .eq("acessorio_sku", acessorioSku)
    .eq("obrigatorio", true)
  if (error) throw error
  return data as CatalogoAcessorioFerramental[]
}

export async function vincularFerramenta(acessorioSku: string, ferramentaSku: string, obrigatorio = true): Promise<void> {
  const { error } = await supabase
    .from("catalogo_acessorio_ferramental")
    .insert({ acessorio_sku: acessorioSku, ferramenta_sku: ferramentaSku, obrigatorio })
  if (error) throw error
}

export async function desvincularFerramenta(acessorioSku: string, ferramentaSku: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_acessorio_ferramental")
    .delete()
    .eq("acessorio_sku", acessorioSku)
    .eq("ferramenta_sku", ferramentaSku)
  if (error) throw error
}

// Categorias de Instrumental
export async function listarCategoriasInstrumental(): Promise<CatalogoCategoriaInstrumental[]> {
  const { data, error } = await supabase
    .from("catalogo_categorias_instrumental")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoCategoriaInstrumental[]
}

export async function criarCategoriaInstrumental(nome: string): Promise<CatalogoCategoriaInstrumental> {
  const { data, error } = await supabase
    .from("catalogo_categorias_instrumental")
    .insert({ nome })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCategoriaInstrumental
}

// Instrumentais Gerais
export async function listarInstrumentais(categoriaId?: string): Promise<CatalogoInstrumentalGeral[]> {
  let query = supabase
    .from("catalogo_instrumentais_gerais")
    .select("*, categoria:catalogo_categorias_instrumental(*)")
    .order("nome")
  if (categoriaId) query = query.eq("categoria_id", categoriaId)
  const { data, error } = await query
  if (error) throw error
  return data as CatalogoInstrumentalGeral[]
}

export async function criarInstrumental(input: { sku: string; categoria_id: string; nome: string }): Promise<CatalogoInstrumentalGeral> {
  const { data, error } = await supabase
    .from("catalogo_instrumentais_gerais")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoInstrumentalGeral
}

export async function toggleCategoriaInstrumentalAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_categorias_instrumental").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function toggleInstrumentalAtivo(sku: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_instrumentais_gerais").update({ ativo }).eq("sku", sku)
  if (error) throw error
}

export async function removerInstrumental(sku: string): Promise<void> {
  const { error } = await supabase.from("catalogo_instrumentais_gerais").delete().eq("sku", sku)
  if (error) throw error
}
