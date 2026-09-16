import { supabase } from "~/lib/supabase"

/**
 * Identifica de onde vem o "cliente" cujo grupo de desconto deve ser aplicado.
 * - catalogoClienteId: cliente com login próprio na loja (catalogo_clientes.grupo_id)
 * - crmClienteId: cliente da carteira do consultor no CRM (clientes.grupo_id) —
 *   usado quando o colaborador seleciona um cliente ativo pra montar orçamento/pedido
 */
export type FonteGrupoCliente = { catalogoClienteId: string } | { crmClienteId: string }

/**
 * Resolve o preço de um produto considerando o contexto:
 * - visitante: retorna null (preço oculto)
 * - colaborador sem cliente ativo selecionado: retorna preço base do produto
 * - colaborador com cliente ativo selecionado, ou cliente logado: resolve
 *   automaticamente pelo grupo do cliente (SKU > categoria > global > base)
 */
export async function resolvePreco(
  contexto: "visitante" | "colaborador" | "cliente",
  produtoSku: string,
  produtoTipo: string,
  precoBase: number,
  fonte?: FonteGrupoCliente | null,
): Promise<number | null> {
  if (contexto === "visitante") return null
  if (fonte) {
    const grupoId = await buscarGrupoId(fonte)
    if (!grupoId) return precoBase
    return resolverPrecoPorGrupo(grupoId, produtoSku, produtoTipo, precoBase)
  }
  return precoBase
}

async function buscarGrupoId(fonte: FonteGrupoCliente): Promise<string | null> {
  if ("catalogoClienteId" in fonte) {
    const { data } = await supabase
      .from("catalogo_clientes")
      .select("grupo_id")
      .eq("id", fonte.catalogoClienteId)
      .single()
    return data?.grupo_id ?? null
  }
  const { data } = await supabase
    .from("clientes")
    .select("grupo_id")
    .eq("id", fonte.crmClienteId)
    .single()
  return data?.grupo_id ?? null
}

async function resolverPrecoPorGrupo(
  grupoId: string,
  produtoSku: string,
  produtoTipo: string,
  precoBase: number,
): Promise<number> {
  // 1. Override por produto (SKU específico) — maior prioridade
  const { data: override } = await supabase
    .from("catalogo_grupo_precos")
    .select("preco")
    .eq("grupo_id", grupoId)
    .eq("produto_sku", produtoSku)
    .eq("produto_tipo", produtoTipo)
    .maybeSingle()

  if (override) return override.preco

  // 2. Desconto por categoria (produto_tipo) do grupo
  const { data: descontoCategoria } = await supabase
    .from("catalogo_grupo_desconto_categoria")
    .select("desconto_percentual")
    .eq("grupo_id", grupoId)
    .eq("produto_tipo", produtoTipo)
    .eq("ativo", true)
    .maybeSingle()

  if (descontoCategoria) {
    return Math.round(precoBase * (1 - descontoCategoria.desconto_percentual / 100) * 100) / 100
  }

  // 3. Desconto global do grupo
  const { data: grupo } = await supabase
    .from("catalogo_grupos_clientes")
    .select("preco_tipo, desconto_percentual")
    .eq("id", grupoId)
    .single()

  if (!grupo) return precoBase

  if (grupo.preco_tipo === "fixo") {
    return grupo.desconto_percentual // valor fixo
  }
  // percentual
  return Math.round(precoBase * (1 - grupo.desconto_percentual / 100) * 100) / 100
}

/**
 * Batch: resolve preços para múltiplos produtos de uma vez
 */
export async function resolvePrecoBatch(
  contexto: "visitante" | "colaborador" | "cliente",
  produtos: Array<{ sku: string; tipo: string; preco_base: number }>,
  fonte?: FonteGrupoCliente | null,
): Promise<Map<string, number | null>> {
  const result = new Map<string, number | null>()

  if (contexto === "visitante") {
    for (const p of produtos) result.set(`${p.tipo}:${p.sku}`, null)
    return result
  }

  if (!fonte) {
    for (const p of produtos) result.set(`${p.tipo}:${p.sku}`, p.preco_base)
    return result
  }

  const grupoId = await buscarGrupoId(fonte)
  if (!grupoId) {
    for (const p of produtos) result.set(`${p.tipo}:${p.sku}`, p.preco_base)
    return result
  }

  const { data: grupo } = await supabase
    .from("catalogo_grupos_clientes")
    .select("preco_tipo, desconto_percentual")
    .eq("id", grupoId)
    .single()

  const { data: overrides } = await supabase
    .from("catalogo_grupo_precos")
    .select("produto_sku, produto_tipo, preco")
    .eq("grupo_id", grupoId)

  const { data: descontosCategoria } = await supabase
    .from("catalogo_grupo_desconto_categoria")
    .select("produto_tipo, desconto_percentual")
    .eq("grupo_id", grupoId)
    .eq("ativo", true)

  const overrideMap = new Map(
    (overrides ?? []).map((o) => [`${o.produto_tipo}:${o.produto_sku}`, o.preco]),
  )
  const categoriaMap = new Map(
    (descontosCategoria ?? []).map((d) => [d.produto_tipo, d.desconto_percentual]),
  )

  for (const p of produtos) {
    const key = `${p.tipo}:${p.sku}`

    const override = overrideMap.get(key)
    if (override !== undefined) {
      result.set(key, override)
      continue
    }

    const descontoCategoria = categoriaMap.get(p.tipo)
    if (descontoCategoria !== undefined) {
      result.set(key, Math.round(p.preco_base * (1 - descontoCategoria / 100) * 100) / 100)
      continue
    }

    if (grupo) {
      if (grupo.preco_tipo === "fixo") {
        result.set(key, grupo.desconto_percentual)
      } else {
        result.set(
          key,
          Math.round(p.preco_base * (1 - grupo.desconto_percentual / 100) * 100) / 100,
        )
      }
    } else {
      result.set(key, p.preco_base)
    }
  }

  return result
}
