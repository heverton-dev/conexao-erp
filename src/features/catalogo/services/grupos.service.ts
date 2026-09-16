import { supabase } from "~/lib/supabase"
import type {
  CatalogoGrupoCliente,
  CatalogoGrupoClienteInput,
  CatalogoGrupoPreco,
  CatalogoGrupoPrecoInput,
  ProdutoDisponivel,
} from "../types/clientes"

// ============================================================
// CRUD Grupos de Clientes
// ============================================================

export async function listarGrupos(): Promise<CatalogoGrupoCliente[]> {
  const { data, error } = await supabase
    .from("catalogo_grupos_clientes")
    .select("*")
    .order("nome")
  if (error) throw error
  return data as CatalogoGrupoCliente[]
}

export async function buscarGrupo(id: string): Promise<CatalogoGrupoCliente | null> {
  const { data, error } = await supabase
    .from("catalogo_grupos_clientes")
    .select("*")
    .eq("id", id)
    .single()
  if (error) return null
  return data as CatalogoGrupoCliente
}

export async function criarGrupo(
  input: CatalogoGrupoClienteInput,
): Promise<CatalogoGrupoCliente> {
  const { data, error } = await supabase
    .from("catalogo_grupos_clientes")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoGrupoCliente
}

export async function atualizarGrupo(
  id: string,
  input: Partial<CatalogoGrupoClienteInput>,
): Promise<CatalogoGrupoCliente> {
  const { data, error } = await supabase
    .from("catalogo_grupos_clientes")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoGrupoCliente
}

export async function deletarGrupo(id: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_grupos_clientes")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ============================================================
// CRUD Preços por Grupo
// ============================================================

export async function listarPrecosGrupo(
  grupoId: string,
): Promise<CatalogoGrupoPreco[]> {
  const { data, error } = await supabase
    .from("catalogo_grupo_precos")
    .select("*")
    .eq("grupo_id", grupoId)
    .order("produto_tipo")
  if (error) throw error
  return data as CatalogoGrupoPreco[]
}

export async function criarPrecoGrupo(
  input: CatalogoGrupoPrecoInput,
): Promise<CatalogoGrupoPreco> {
  const { data, error } = await supabase
    .from("catalogo_grupo_precos")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoGrupoPreco
}

export async function atualizarPrecoGrupo(
  id: string,
  preco: number,
): Promise<CatalogoGrupoPreco> {
  const { data, error } = await supabase
    .from("catalogo_grupo_precos")
    .update({ preco })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoGrupoPreco
}

export async function deletarPrecoGrupo(id: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_grupo_precos")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ============================================================
// Produtos disponíveis para override
// ============================================================

export async function listarProdutosEmpresa(): Promise<ProdutoDisponivel[]> {
  const [implantes, abutments, fresas, chaves, acessorios, instrumentais, kits] = await Promise.all([
    supabase
      .from("catalogo_implantes")
      .select("sku, preco, linha:catalogo_linhas(nome, familia:catalogo_familias(nome))")
      .eq("ativo", true),
    supabase
      .from("catalogo_abutments")
      .select("sku, preco, familia:catalogo_familias(nome)"),
    supabase
      .from("catalogo_fresas")
      .select("sku, nome, preco")
      .eq("ativo", true),
    supabase
      .from("catalogo_chaves_ferramental")
      .select("sku, nome, preco"),
    supabase
      .from("catalogo_acessorios")
      .select("sku, nome, preco, categoria:catalogo_categorias_acessorios(nome)"),
    supabase
      .from("catalogo_instrumentais_gerais")
      .select("sku, nome, preco"),
    supabase
      .from("catalogo_kits")
      .select("sku, nome, preco")
      .eq("ativo", true),
  ])

  const produtos: ProdutoDisponivel[] = []

  for (const i of (implantes.data ?? [])) {
    const linha = i.linha as any
    const familia = linha?.familia as any
    produtos.push({
      sku: i.sku,
      nome: `${familia?.nome ?? ""} ${linha?.nome ?? ""} ${i.sku}`.trim(),
      tipo: "implante",
      preco_base: i.preco ?? null,
      familia_nome: familia?.nome,
      linha_nome: linha?.nome,
    })
  }

  for (const a of (abutments.data ?? [])) {
    const familia = a.familia as any
    produtos.push({
      sku: a.sku,
      nome: `${familia?.nome ?? ""} Abutment ${a.sku}`.trim(),
      tipo: "abutment",
      preco_base: a.preco ?? null,
      familia_nome: familia?.nome,
    })
  }

  for (const f of (fresas.data ?? [])) {
    produtos.push({
      sku: f.sku,
      nome: f.nome || f.sku,
      tipo: "fresa",
      preco_base: f.preco ?? null,
    })
  }

  for (const c of (chaves.data ?? [])) {
    produtos.push({
      sku: c.sku,
      nome: c.nome || c.sku,
      tipo: "chave",
      preco_base: c.preco ?? null,
    })
  }

  for (const a of (acessorios.data ?? [])) {
    const cat = a.categoria as any
    produtos.push({
      sku: a.sku,
      nome: `${cat?.nome ?? ""} ${a.nome || a.sku}`.trim(),
      tipo: "acessorio",
      preco_base: a.preco ?? null,
    })
  }

  for (const ins of (instrumentais.data ?? [])) {
    produtos.push({
      sku: ins.sku,
      nome: ins.nome || ins.sku,
      tipo: "instrumental",
      preco_base: ins.preco ?? null,
    })
  }

  for (const k of (kits.data ?? [])) {
    produtos.push({
      sku: k.sku,
      nome: k.nome || k.sku,
      tipo: "kit",
      preco_base: k.preco ?? null,
    })
  }

  return produtos.sort((a, b) => a.nome.localeCompare(b.nome))
}

// ============================================================
// Salvar todos os preços de um grupo (replace)
// ============================================================

export async function salvarPrecosGrupo(
  grupoId: string,
  precos: Array<{
    produto_sku: string
    produto_tipo: string
    preco: number
    preco_tipo: "fixo" | "percentual"
    desconto_percentual: number
  }>,
): Promise<void> {
  // Deleta existentes
  await supabase
    .from("catalogo_grupo_precos")
    .delete()
    .eq("grupo_id", grupoId)

  // Insere novos
  if (precos.length > 0) {
    const rows = precos.map((p) => ({
      grupo_id: grupoId,
      produto_sku: p.produto_sku,
      produto_tipo: p.produto_tipo,
      preco: p.preco,
      preco_tipo: p.preco_tipo,
      desconto_percentual: p.desconto_percentual,
    }))
    const { error } = await supabase.from("catalogo_grupo_precos").insert(rows)
    if (error) throw error
  }
}

// ============================================================
// Copiar preços de um grupo para outro
// ============================================================

export async function copiarPrecosGrupo(
  grupoOrigemId: string,
  grupoDestinoId: string,
): Promise<number> {
  const { data: origem, error: fetchError } = await supabase
    .from("catalogo_grupo_precos")
    .select("produto_sku, produto_tipo, preco, preco_tipo, desconto_percentual")
    .eq("grupo_id", grupoOrigemId)

  if (fetchError) throw fetchError
  if (!origem || origem.length === 0) return 0

  // Deleta existentes no destino
  await supabase
    .from("catalogo_grupo_precos")
    .delete()
    .eq("grupo_id", grupoDestinoId)

  // Insere cópias
  const rows = origem.map((p) => ({
    grupo_id: grupoDestinoId,
    produto_sku: p.produto_sku,
    produto_tipo: p.produto_tipo,
    preco: p.preco,
    preco_tipo: p.preco_tipo ?? "fixo",
    desconto_percentual: p.desconto_percentual ?? 0,
  }))

  const { error: insertError } = await supabase.from("catalogo_grupo_precos").insert(rows)
  if (insertError) throw insertError

  return rows.length
}
