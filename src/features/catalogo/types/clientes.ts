import type { ProductSheetTipo } from "./index"

// ============================================================
// Types: Grupos de Clientes
// ============================================================

export type PrecoTipo = "percentual" | "fixo"

export interface CatalogoGrupoCliente {
  id: string
  nome: string
  descricao: string | null
  preco_tipo: PrecoTipo
  desconto_percentual: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoGrupoClienteInput {
  nome: string
  descricao?: string | null
  preco_tipo?: PrecoTipo
  desconto_percentual?: number
  ativo?: boolean
}

// ============================================================
// Types: Preços por Grupo
// ============================================================

export interface CatalogoGrupoPreco {
  id: string
  grupo_id: string
  produto_sku: string
  produto_tipo: string
  preco: number
  preco_tipo: PrecoTipo
  desconto_percentual: number
  created_at: string
}

export interface CatalogoGrupoPrecoInput {
  grupo_id: string
  produto_sku: string
  produto_tipo: string
  preco: number
  preco_tipo?: PrecoTipo
  desconto_percentual?: number
}

// ============================================================
// Types: Produto disponível para override
// ============================================================

export interface ProdutoDisponivel {
  sku: string
  nome: string
  tipo: ProductSheetTipo
  preco_base: number | null
  familia_nome?: string
  linha_nome?: string
}

// ============================================================
// Types: Clientes do Catálogo
// ============================================================

export type ClienteTipo = "cliente" | "parceiro" | "revendedor"

export interface CatalogoCliente {
  id: string
  cadastro_id: string | null
  user_id: string | null
  grupo_id: string | null
  nome: string
  email: string
  telefone: string | null
  tipo: ClienteTipo
  ativo: boolean
  created_at: string
  updated_at: string
  // Relações (opcionais)
  grupo?: CatalogoGrupoCliente
  cadastro?: {
    id: string
    codigo_cliente: string | null
    status: string
    pf?: { nome: string; cpf: string } | null
    pj?: { razao_social: string; cnpj: string } | null
  }
}

export interface CatalogoClienteInput {
  cadastro_id?: string | null
  grupo_id?: string | null
  nome: string
  email: string
  telefone?: string | null
  tipo?: ClienteTipo
  ativo?: boolean
  // Para criar auth user
  senha?: string
}

// ============================================================
// Types: Permissões do Cliente
// ============================================================

export interface CatalogoClientePermissao {
  id: string
  cliente_id: string
  permissao_key: string
  ativo: boolean
  created_at: string
}

export const CATALOGO_CLIENTE_PERMISSIONS = [
  { key: "catalogo_cliente_ver_produtos" as const, label: "Ver produtos", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_ver_precos" as const, label: "Ver preços", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_comprar" as const, label: "Comprar", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_ver_pedidos" as const, label: "Ver pedidos", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_ver_favoritos" as const, label: "Favoritos", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_rastrear" as const, label: "Rastrear entrega", group: "Catálogo Cliente" },
] as const

export type CatalogoClientePermissaoKey = typeof CATALOGO_CLIENTE_PERMISSIONS[number]["key"]

// ============================================================
// Types: Solicitações de Acesso
// ============================================================

export type SolicitacaoStatus = "pendente" | "aprovada" | "rejeitada"

export interface CatalogoSolicitacaoAcesso {
  id: string
  nome: string
  email: string
  telefone: string | null
  mensagem: string | null
  status: SolicitacaoStatus
  responded_by: string | null
  responded_at: string | null
  created_at: string
}

export interface CatalogoSolicitacaoAcessoInput {
  nome: string
  email: string
  telefone?: string | null
  mensagem?: string | null
}
