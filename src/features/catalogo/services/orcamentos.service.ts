import { supabase } from "~/lib/supabase"
import type {
  CatalogoOrcamento,
  CatalogoOrcamentoInput,
  StatusOrcamento,
} from "../types/orcamentos"
import { dispararEventoModulo } from "~/core/services/webhooks"

const MODULO_KEY = "catalogo"

// ============================================================
// CRUD Orçamentos
// ============================================================

export async function listarOrcamentos(
  filters?: { status?: StatusOrcamento; colaborador_id?: string; search?: string },
): Promise<CatalogoOrcamento[]> {
  let query = supabase
    .from("catalogo_orcamentos")
    .select("*, itens:catalogo_orcamento_itens(*), colaborador:profiles(id, nome, email)")
    .order("created_at", { ascending: false })

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.colaborador_id) query = query.eq("colaborador_id", filters.colaborador_id)
  if (filters?.search) {
    query = query.or(
      `cliente_nome.ilike.%${filters.search}%,cliente_email.ilike.%${filters.search}%`,
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data as CatalogoOrcamento[]
}

export async function listarOrcamentosColaborador(
  colaboradorId: string,
): Promise<CatalogoOrcamento[]> {
  const { data, error } = await supabase
    .from("catalogo_orcamentos")
    .select("*, itens:catalogo_orcamento_itens(*)")
    .eq("colaborador_id", colaboradorId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as CatalogoOrcamento[]
}

export async function buscarOrcamento(id: string): Promise<CatalogoOrcamento | null> {
  const { data, error } = await supabase
    .from("catalogo_orcamentos")
    .select("*, itens:catalogo_orcamento_itens(*), colaborador:profiles(id, nome, email)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as CatalogoOrcamento
}

export async function buscarOrcamentoPorToken(token: string): Promise<CatalogoOrcamento | null> {
  // Busca orçamento via RPC SECURITY DEFINER (ignora RLS)
  const { data: orcamento, error } = await supabase
    .rpc("buscar_orcamento_por_token", { p_token: token })
    .single()
  if (error || !orcamento) return null

  // Busca itens separadamente via RPC
  const { data: itens } = await supabase
    .rpc("buscar_itens_orcamento", { p_orcamento_id: (orcamento as CatalogoOrcamento).id })

  return { ...orcamento, itens: itens ?? [] } as CatalogoOrcamento
}
/** Atualiza status do orçamento por token (acesso público, via RPC SECURITY DEFINER) */
export async function atualizarStatusOrcamentoPorToken(
  token: string,
  status: StatusOrcamento,
): Promise<CatalogoOrcamento | null> {
  const { data, error } = await supabase
    .rpc("atualizar_status_orcamento_por_token", { p_token: token, p_status: status })
    .single()
  if (error || !data) return null
  return data as CatalogoOrcamento
}

export async function criarOrcamento(
  colaboradorId: string,
  input: CatalogoOrcamentoInput,
): Promise<CatalogoOrcamento> {
  // Calcula totais
  const valorSubtotal = input.itens.reduce(
    (acc, item) => acc + item.preco_unitario * item.quantidade,
    0,
  )

  // Busca dados do cliente se tem cliente_id
  let clienteNome = input.cliente_nome ?? null
  let clienteEmail = input.cliente_email ?? null
  let clienteTelefone = input.cliente_telefone ?? null

  if (input.cliente_id && !clienteNome) {
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

  // Busca dados do cliente da carteira do CRM se tem cliente_crm_id
  // `clientes` não tem coluna de e-mail no schema atual — clienteEmail fica null
  if (input.cliente_crm_id && !clienteNome) {
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
  }

  const { data: orcamento, error: orcError } = await supabase
    .from("catalogo_orcamentos")
    .insert({
      colaborador_id: colaboradorId,
      cliente_id: input.cliente_id ?? null,
      cliente_crm_id: input.cliente_crm_id ?? null,
      cliente_nome: clienteNome,
      cliente_email: clienteEmail,
      cliente_telefone: clienteTelefone,
      validade_dias: input.validade_dias ?? 7,
      observacoes: input.observacoes ?? null,
      valor_subtotal: valorSubtotal,
      valor_desconto: 0,
      valor_total: valorSubtotal,
    })
    .select()
    .single()
  if (orcError) throw orcError

  // Insere itens
  if (input.itens.length > 0) {
    const itensRows = input.itens.map((item) => ({
      orcamento_id: orcamento.id,
      produto_sku: item.produto_sku,
      produto_tipo: item.produto_tipo,
      produto_nome: item.produto_nome,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
    }))
    const { error: itensError } = await supabase
      .from("catalogo_orcamento_itens")
      .insert(itensRows)
    if (itensError) throw itensError
  }

  dispararEventoModulo(MODULO_KEY, "orcamento.criado", {
    orcamento_id: orcamento.id,
    colaborador_id: colaboradorId,
  }).catch(() => {})

  return buscarOrcamento(orcamento.id) as Promise<CatalogoOrcamento>
}

export async function atualizarStatusOrcamento(
  id: string,
  status: StatusOrcamento,
): Promise<CatalogoOrcamento> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === "aprovado") {
    updates.aprovado_em = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("catalogo_orcamentos")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  const eventoKey = `orcamento.${status}` as const
  dispararEventoModulo(MODULO_KEY, eventoKey, {
    orcamento_id: id,
  }).catch(() => {})

  return data as CatalogoOrcamento
}

export async function deletarOrcamento(id: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_orcamentos")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ============================================================
// Conversão de Orçamento em Pedido
// ============================================================

export async function converterEmPedido(
  orcamentoId: string,
): Promise<string> {
  const orcamento = await buscarOrcamento(orcamentoId)
  if (!orcamento || !orcamento.itens) throw new Error("Orçamento não encontrado")

  if (orcamento.status !== "aprovado") {
    throw new Error("Apenas orçamentos aprovados podem ser convertidos em pedido")
  }

  // Cria pedido
  const { data: pedido, error: pedError } = await supabase
    .from("catalogo_pedidos")
    .insert({
      cliente_id: orcamento.cliente_id,
      cliente_crm_id: orcamento.cliente_crm_id,
      orcamento_id: orcamento.id,
      colaborador_id: orcamento.colaborador_id,
      status: "pendente",
      valor_subtotal: orcamento.valor_subtotal,
      valor_desconto: orcamento.valor_desconto,
      valor_total: orcamento.valor_total,
      cliente_nome: orcamento.cliente_nome,
      cliente_email: orcamento.cliente_email,
      cliente_telefone: orcamento.cliente_telefone,
    })
    .select()
    .single()
  if (pedError) throw pedError

  // Copia itens
  const itensRows = orcamento.itens.map((item) => ({
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

  // Atualiza status do orçamento
  await atualizarStatusOrcamento(orcamentoId, "pedido")

  dispararEventoModulo(MODULO_KEY, "orcamento.pedido_criado", {
    orcamento_id: orcamentoId,
    pedido_id: pedido.id,
  }).catch(() => {})

  return pedido.id
}
