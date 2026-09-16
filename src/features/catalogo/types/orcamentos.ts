// ============================================================
// Types: Orçamentos
// ============================================================

export type StatusOrcamento =
  | "rascunho"
  | "enviado"
  | "aprovado"
  | "reprovado"
  | "pedido"
  | "expirado"

export interface CatalogoOrcamento {
  id: string
  colaborador_id: string
  cliente_id: string | null
  cliente_crm_id: string | null
  cliente_nome: string | null
  cliente_email: string | null
  cliente_telefone: string | null
  token_acesso: string
  status: StatusOrcamento
  validade_dias: number
  observacoes: string | null
  valor_subtotal: number
  valor_desconto: number
  valor_total: number
  aprovado_em: string | null
  expira_em: string | null
  created_at: string
  updated_at: string
  // Relações
  itens?: CatalogoOrcamentoItem[]
  colaborador?: { id: string; nome: string; email: string }
  cliente?: { id: string; nome: string; email: string }
}

export interface CatalogoOrcamentoItem {
  id: string
  orcamento_id: string
  produto_sku: string
  produto_tipo: string
  produto_nome: string
  quantidade: number
  preco_unitario: number
  created_at: string
}

export interface CatalogoOrcamentoInput {
  cliente_id?: string | null
  cliente_crm_id?: string | null
  cliente_nome?: string | null
  cliente_email?: string | null
  cliente_telefone?: string | null
  validade_dias?: number
  observacoes?: string | null
  itens: CatalogoOrcamentoItemInput[]
}

export interface CatalogoOrcamentoItemInput {
  produto_sku: string
  produto_tipo: string
  produto_nome: string
  quantidade: number
  preco_unitario: number
}

export const STATUS_ORCAMENTO_LABEL: Record<StatusOrcamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  pedido: "Convertido em Pedido",
  expirado: "Expirado",
}

export const STATUS_ORCAMENTO_COLOR: Record<StatusOrcamento, string> = {
  rascunho: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
  enviado: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  aprovado: "bg-green-500/15 text-green-400 border border-green-500/20",
  reprovado: "bg-red-500/15 text-red-400 border border-red-500/20",
  pedido: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  expirado: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
}
