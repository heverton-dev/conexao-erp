// ============================================================
// Types: Pedidos
// ============================================================

export type StatusPedido =
  | "pendente"
  | "pago"
  | "confirmado"
  | "separando"
  | "enviado"
  | "entregue"
  | "cancelado"

export interface CatalogoPedido {
  id: string
  cliente_id: string | null
  cliente_crm_id: string | null
  orcamento_id: string | null
  colaborador_id: string | null
  status: StatusPedido
  valor_subtotal: number
  valor_frete: number
  valor_desconto: number
  valor_total: number
  cupom_codigo: string | null
  cupom_desconto: number
  endereco_entrega: Record<string, unknown> | null
  observacoes: string | null
  tracking_code: string | null
  cliente_nome: string | null
  cliente_email: string | null
  cliente_telefone: string | null
  created_at: string
  updated_at: string
  // Relações
  itens?: CatalogoPedidoItem[]
  cliente?: { id: string; nome: string; email: string }
  colaborador?: { id: string; nome: string }
}

export interface CatalogoPedidoItem {
  id: string
  pedido_id: string
  produto_sku: string
  produto_tipo: string
  produto_nome: string
  quantidade: number
  preco_unitario: number
  created_at: string
}

export interface CatalogoPedidoInput {
  cliente_id?: string | null
  cliente_crm_id?: string | null
  orcamento_id?: string | null
  colaborador_id?: string | null
  endereco_entrega?: Record<string, unknown> | null
  observacoes?: string | null
  cupom_codigo?: string | null
  cupom_desconto?: number
  valor_frete?: number
  itens: CatalogoPedidoItemInput[]
}

export interface CatalogoPedidoItemInput {
  produto_sku: string
  produto_tipo: string
  produto_nome: string
  quantidade: number
  preco_unitario: number
}

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  pendente: "Pendente",
  pago: "Pago",
  confirmado: "Confirmado",
  separando: "Separando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
}

export const STATUS_PEDIDO_COLOR: Record<StatusPedido, string> = {
  pendente: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  pago: "bg-green-500/15 text-green-400 border border-green-500/20",
  confirmado: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  separando: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  enviado: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
  entregue: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  cancelado: "bg-red-500/15 text-red-400 border border-red-500/20",
}

// ============================================================
// Types: Favoritos
// ============================================================

export interface CatalogoFavorito {
  id: string
  cliente_id: string
  produto_sku: string
  produto_tipo: string
  created_at: string
}
