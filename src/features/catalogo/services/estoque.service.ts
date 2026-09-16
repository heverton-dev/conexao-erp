import { supabase } from "~/lib/supabase"

// ============================================================
// Types
// ============================================================

export interface EstoqueItem {
  sku: string
  nome: string
  tipo: string
  qtd_disponivel: number
  qtd_minima_aviso: number
}

// ============================================================
// Mapeamento tipo → tabela
// ============================================================

const TIPO_TABELA: Record<string, string> = {
  implante: "catalogo_implantes",
  abutment: "catalogo_abutments",
  kit: "catalogo_kits",
  fresa: "catalogo_fresas",
  chave: "catalogo_chaves",
  complementar: "catalogo_complementares",
  opcional: "catalogo_opcionais",
  componente: "catalogo_componentes",
  parafuso: "catalogo_parafusos",
  cicatrizador: "catalogo_cicatrizadores",
  acessorio: "catalogo_acessorios",
  instrumental: "catalogo_instrumentais",
  promocional: "catalogo_promocionais",
}

// ============================================================
// Service
// ============================================================

/**
 * Lista estoque de todos os produtos (ou filtrado por tipo).
 */
export async function listarEstoque(tipo?: string): Promise<EstoqueItem[]> {
  const tipos = tipo ? [tipo] : Object.keys(TIPO_TABELA)
  const results: EstoqueItem[] = []

  const queries = tipos.map(async (t) => {
    const tabela = TIPO_TABELA[t]
    if (!tabela) return []

    const { data } = await supabase
      .from(tabela)
      .select("sku, nome, qtd_disponivel, qtd_minima_aviso")
      .eq("ativo", true)
      .order("nome")

    return (data ?? []).map((row) => ({
      sku: row.sku,
      nome: row.nome,
      tipo: t,
      qtd_disponivel: row.qtd_disponivel ?? 0,
      qtd_minima_aviso: row.qtd_minima_aviso ?? 0,
    }))
  })

  const allResults = await Promise.all(queries)
  for (const r of allResults) results.push(...r)

  return results.sort((a, b) => a.nome.localeCompare(b.nome))
}

/**
 * Atualiza estoque de um produto.
 */
export async function atualizarEstoque(
  sku: string,
  tipo: string,
  qtdDisponivel: number,
  qtdMinimaAviso: number,
): Promise<void> {
  const tabela = TIPO_TABELA[tipo]
  if (!tabela) throw new Error(`Tipo inválido: ${tipo}`)

  const { error } = await supabase
    .from(tabela)
    .update({
      qtd_disponivel: qtdDisponivel,
      qtd_minima_aviso: qtdMinimaAviso,
    })
    .eq("sku", sku)

  if (error) throw error
}

/**
 * Lista apenas produtos com estoque baixo.
 */
export async function listarEstoqueBaixo(): Promise<EstoqueItem[]> {
  const all = await listarEstoque()
  return all.filter((item) => item.qtd_minima_aviso > 0 && item.qtd_disponivel <= item.qtd_minima_aviso)
}
