import { supabase } from "~/lib/supabase"
import type {
  CatalogoPedido,
  CatalogoPedidoInput,
  StatusPedido,
} from "../types/pedidos"
import { dispararEventoModulo } from "~/core/services/webhooks"

const MODULO_KEY = "catalogo"

// ============================================================
// CRUD Pedidos
// ============================================================

export async function listarPedidos(
  filters?: { status?: StatusPedido; cliente_id?: string; search?: string },
): Promise<CatalogoPedido[]> {
  let query = supabase
    .from("catalogo_pedidos")
    .select("*, itens:catalogo_pedido_itens(*)")
    .order("created_at", { ascending: false })

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.cliente_id) query = query.eq("cliente_id", filters.cliente_id)
  if (filters?.search) {
    query = query.or(
      `cliente_nome.ilike.%${filters.search}%,cliente_email.ilike.%${filters.search}%`,
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data as CatalogoPedido[]
}

export async function listarPedidosCliente(
  clienteId: string,
): Promise<CatalogoPedido[]> {
  const { data, error } = await supabase
    .from("catalogo_pedidos")
    .select("*, itens:catalogo_pedido_itens(*)")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as CatalogoPedido[]
}

export async function listarPedidosColaborador(
  colaboradorId: string,
): Promise<CatalogoPedido[]> {
  const { data, error } = await supabase
    .from("catalogo_pedidos")
    .select("*, itens:catalogo_pedido_itens(*)")
    .eq("colaborador_id", colaboradorId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as CatalogoPedido[]
}

export async function buscarPedido(id: string): Promise<CatalogoPedido | null> {
  const { data, error } = await supabase
    .from("catalogo_pedidos")
    .select("*, itens:catalogo_pedido_itens(*)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as CatalogoPedido
}

export async function criarPedido(
  input: CatalogoPedidoInput,
): Promise<CatalogoPedido> {
  const valorSubtotal = input.itens.reduce(
    (acc, item) => acc + item.preco_unitario * item.quantidade,
    0,
  )
  const valorTotal = valorSubtotal + (input.valor_frete ?? 0) - (input.cupom_desconto ?? 0)

  // Snapshot do cliente (loja ou CRM)
  let clienteNome = null
  let clienteEmail = null
  let clienteTelefone = null

  if (input.cliente_crm_id) {
    // Consultor selecionou cliente da carteira CRM
    // `clientes` não tem coluna de e-mail no schema atual — clienteEmail fica null
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("nome_doutor, telefone_contato")
      .eq("id", input.cliente_crm_id)
      .single()
    if (clienteError) console.error("Erro ao buscar cliente CRM:", clienteError)
    if (cliente) {
      clienteNome = cliente.nome_doutor
      clienteTelefone = cliente.telefone_contato
    }
  } else if (input.cliente_id) {
    // Cliente final da loja
    const { data: cliente } = await supabase
      .from("catalogo_clientes")
      .select("nome, email, telefone")
      .eq("id", input.cliente_id)
      .single()
    if (cliente) {
      clienteNome = cliente.nome
      clienteEmail = cliente.email
      clienteTelefone = cliente.telefone
    }
  }

  const { data: pedido, error: pedError } = await supabase
    .from("catalogo_pedidos")
    .insert({
      cliente_id: input.cliente_id ?? null,
      cliente_crm_id: input.cliente_crm_id ?? null,
      orcamento_id: input.orcamento_id ?? null,
      colaborador_id: input.colaborador_id ?? null,
      status: "pendente",
      valor_subtotal: valorSubtotal,
      valor_frete: input.valor_frete ?? 0,
      valor_desconto: input.cupom_desconto ?? 0,
      valor_total: valorTotal,
      cupom_codigo: input.cupom_codigo ?? null,
      cupom_desconto: input.cupom_desconto ?? 0,
      endereco_entrega: input.endereco_entrega ?? null,
      observacoes: input.observacoes ?? null,
      cliente_nome: clienteNome,
      cliente_email: clienteEmail,
      cliente_telefone: clienteTelefone,
    })
    .select()
    .single()
  if (pedError) throw pedError

  // Insere itens
  if (input.itens.length > 0) {
    const itensRows = input.itens.map((item) => ({
      pedido_id: pedido.id,
      produto_sku: item.produto_sku,
      produto_tipo: item.produto_tipo,
      produto_nome: item.produto_nome,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
    }))
    const { error: itensError } = await supabase
      .from("catalogo_pedido_itens")
      .insert(itensRows)
    if (itensError) throw itensError
  }

  dispararEventoModulo(MODULO_KEY, "pedido.criado", {
    pedido_id: pedido.id,
  }).catch(() => {})

  return buscarPedido(pedido.id) as Promise<CatalogoPedido>
}

export async function atualizarStatusPedido(
  id: string,
  status: StatusPedido,
): Promise<CatalogoPedido> {
  const { data, error } = await supabase
    .from("catalogo_pedidos")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  const eventoKey = `pedido.${status}` as const
  dispararEventoModulo(MODULO_KEY, eventoKey, {
    pedido_id: id,
  }).catch(() => {})

  return data as CatalogoPedido
}

export async function deletarPedido(id: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_pedidos")
    .delete()
    .eq("id", id)
  if (error) throw error
}
