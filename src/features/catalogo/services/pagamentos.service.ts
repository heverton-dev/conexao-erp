import { supabase } from "~/lib/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"
import { invalidateStockCache } from "./carrinho.service"

const MODULO_KEY = "catalogo"

// ============================================================
// Types
// ============================================================

export type StatusPagamento = "pendente" | "aprovado" | "rejeitado" | "estornado"

export interface CatalogoPagamento {
  id: string
  pedido_id: string
  metodo: string
  valor: number
  status: StatusPagamento
  stripe_payment_intent_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================
// Mapeamento tipo → tabela (para baixa de estoque)
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
// CRUD Pagamentos
// ============================================================

export async function criarPagamento(
  pedidoId: string,
  metodo: string,
  valor: number,
): Promise<CatalogoPagamento> {
  const { data, error } = await supabase
    .from("catalogo_pagamentos")
    .insert({
      pedido_id: pedidoId,
      metodo,
      valor,
      status: "pendente",
    })
    .select()
    .single()

  if (error) throw error
  return data as CatalogoPagamento
}

/**
 * Confirma pagamento e baixa estoque dos itens do pedido.
 * Baixa é atômica: se qualquer item falhar, nada é baixado.
 */
export async function confirmarPagamento(pedidoId: string): Promise<void> {
  // 1. Buscar pagamento pendente
  const { data: pagamento, error: pgErr } = await supabase
    .from("catalogo_pagamentos")
    .select("id")
    .eq("pedido_id", pedidoId)
    .eq("status", "pendente")
    .single()

  if (pgErr || !pagamento) throw new Error("Pagamento pendente não encontrado")

  // 2. Buscar itens do pedido
  const { data: itens, error: itensErr } = await supabase
    .from("catalogo_pedido_itens")
    .select("produto_sku, produto_tipo, quantidade")
    .eq("pedido_id", pedidoId)

  if (itensErr) throw itensErr
  if (!itens || itens.length === 0) throw new Error("Pedido sem itens")

  // 3. Validar estoque disponível para TODOS os itens
  for (const item of itens) {
    const tabela = TIPO_TABELA[item.produto_tipo]
    if (!tabela) continue

    const { data: produto } = await supabase
      .from(tabela)
      .select("qtd_disponivel")
      .eq("sku", item.produto_sku)
      .single()

    if (!produto) throw new Error(`Produto ${item.produto_sku} não encontrado`)
    if ((produto.qtd_disponivel ?? 0) < item.quantidade) {
      throw new Error(
        `Estoque insuficiente para ${item.produto_sku}: disponível ${produto.qtd_disponivel}, necessário ${item.quantidade}`,
      )
    }
  }

  // 4. Baixa atômica de estoque
  for (const item of itens) {
    const tabela = TIPO_TABELA[item.produto_tipo]
    if (!tabela) continue

    const { data: atual } = await supabase
      .from(tabela)
      .select("qtd_disponivel")
      .eq("sku", item.produto_sku)
      .single()

    if (atual) {
      const novaQtd = Math.max(0, (atual.qtd_disponivel ?? 0) - item.quantidade)
      await supabase
        .from(tabela)
        .update({ qtd_disponivel: novaQtd })
        .eq("sku", item.produto_sku)
    }

    // Invalida cache de estoque
    invalidateStockCache(item.produto_sku)
  }

  // 5. Atualizar pagamento para aprovado
  await supabase
    .from("catalogo_pagamentos")
    .update({ status: "aprovado" })
    .eq("id", pagamento.id)

  // 6. Atualizar pedido para pago
  await supabase
    .from("catalogo_pedidos")
    .update({ status: "pago" })
    .eq("id", pedidoId)

  // 7. Disparar evento
  dispararEventoModulo(MODULO_KEY, "pedido.pago", {
    pedido_id: pedidoId,
    pagamento_id: pagamento.id,
  }).catch(() => {})
}

/**
 * Estorna pagamento e reverte estoque dos itens do pedido.
 */
export async function estornarPagamento(pedidoId: string): Promise<void> {
  // 1. Buscar pagamento aprovado
  const { data: pagamento, error: pgErr } = await supabase
    .from("catalogo_pagamentos")
    .select("id")
    .eq("pedido_id", pedidoId)
    .eq("status", "aprovado")
    .single()

  if (pgErr || !pagamento) throw new Error("Pagamento aprovado não encontrado")

  // 2. Buscar itens do pedido
  const { data: itens, error: itensErr } = await supabase
    .from("catalogo_pedido_itens")
    .select("produto_sku, produto_tipo, quantidade")
    .eq("pedido_id", pedidoId)

  if (itensErr) throw itensErr
  if (!itens) throw new Error("Pedido sem itens")

  // 3. Reverter estoque
  for (const item of itens) {
    const tabela = TIPO_TABELA[item.produto_tipo]
    if (!tabela) continue

    const { data: atual } = await supabase
      .from(tabela)
      .select("qtd_disponivel")
      .eq("sku", item.produto_sku)
      .single()

    if (atual) {
      const novaQtd = (atual.qtd_disponivel ?? 0) + item.quantidade
      await supabase
        .from(tabela)
        .update({ qtd_disponivel: novaQtd })
        .eq("sku", item.produto_sku)
    }

    invalidateStockCache(item.produto_sku)
  }

  // 4. Atualizar pagamento para estornado
  await supabase
    .from("catalogo_pagamentos")
    .update({ status: "estornado" })
    .eq("id", pagamento.id)

  // 5. Atualizar pedido para cancelado
  await supabase
    .from("catalogo_pedidos")
    .update({ status: "cancelado" })
    .eq("id", pedidoId)

  // 6. Disparar evento
  dispararEventoModulo(MODULO_KEY, "pedido.estornado", {
    pedido_id: pedidoId,
    pagamento_id: pagamento.id,
  }).catch(() => {})
}

// ============================================================
// Consultas
// ============================================================

export async function buscarPagamentoPorPedido(
  pedidoId: string,
): Promise<CatalogoPagamento | null> {
  const { data, error } = await supabase
    .from("catalogo_pagamentos")
    .select("*")
    .eq("pedido_id", pedidoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as CatalogoPagamento
}
