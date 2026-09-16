/** @deprecated Dynamic from DB - use string */
export type TipoOsso = string

export type ProductSheetTipo =
  | "implante"
  | "abutment"
  | "kit"
  | "fresa"
  | "chave"
  | "complementar"
  | "opcional"
  | "componente"
  | "parafuso"
  | "cicatrizador"
  | "acessorio"
  | "instrumental"
  | "promocional"
  | "acessorio"
  | "instrumental"

export type ProdutoTipoImagem =
  | "implante"
  | "abutment"
  | "kit"
  | "parafuso"
  | "cicatrizador"
  | "chave"
  | "fresa"
  | "complementar"
  | "opcional"
  | "componente"
  | "promocional"

export type FonteImagem = "upload" | "url" | "gdrive"

// ============================================================
// ESTRUTURA - Categorias
// ============================================================

export interface CatalogoCategoria {
  id: string
  nome: string
  sigla: string | null
  locked: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// ESTRUTURA - Hierarquia IPS (Implante/Prótese/Sistema)
// ============================================================

export interface CatalogoIpsConexao {
  id: string
  categoria_id: string
  nome: string
  sigla: string
  locked: boolean
  ativo: boolean
  created_at: string
  updated_at: string
  categoria?: CatalogoCategoria
}

export interface CatalogoIpsFamilia {
  id: string
  conexao_id: string
  nome: string
  cor_identificacao: string
  locked: boolean
  ativo: boolean
  created_at: string
  updated_at: string
  conexao?: CatalogoIpsConexao
}

export interface CatalogoIpsLinha {
  id: string
  familia_id: string
  nome: string
  ativo: boolean
  created_at: string
  updated_at: string
  familia?: CatalogoIpsFamilia
}

// ============================================================
// ESTRUTURA - Tipos de Componentes
// ============================================================

export interface CatalogoCpsTipoReabilitacao {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoCpsTipoAbutment {
  id: string
  nome: string
  sigla: string | null
  tipo_reabilitacao_id: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_reabilitacao?: CatalogoCpsTipoReabilitacao
}

export interface CatalogoCpsTipoComponente {
  id: string
  nome: string
  sigla: string | null
  categoria_id: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  categoria?: CatalogoCategoria
}

export interface CatalogoCpsTipoParafuso {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoCpsTipoCicatrizador {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// INSTRUMENTAIS - Tipos
// ============================================================

export interface CatalogoTipoChave {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoTipoFresa {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoTipoComplementar {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoTipoOpcional {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}
// ============================================================
// TIPOS DE OSSO - Densidade óssea (antes: Tipos de Fresagens)
// ============================================================

export interface CatalogoTipoOsso {
  id: string
  nome: string
  sigla: string | null
  categoria: "hard" | "soft"
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoProtocoloFresagem {
  id: string
  nome: string
  tipo_osso: string
  sigla: string | null
  diametro_mm_aplicavel: number | null
  ativo: boolean
  created_at: string
  updated_at: string
  fresas?: CatalogoProtocoloFresaItem[]
}

export interface CatalogoProtocoloFresaItem {
  id: string
  protocolo_id: string
  fresa_id: string
  ordem: number
  created_at: string
  fresa?: CatalogoFresa
}

/**
 * Formato achatado de item de fresagem, retornado por
 * `implantes.service.getProtocoloFresagem` e consumido por `FresagemTimeline`.
 * Difere de `CatalogoProtocoloFresagem` (linha de protocolo) por já trazer
 * a fresa e a ordem de uso no nível do item.
 */
export interface CatalogoProtocoloFresagemFlat {
  id: string
  nome: string
  tipo_osso: string
  sigla: string | null
  diametro_mm_aplicavel: number | null
  ativo: boolean
  created_at: string
  updated_at: string
  ordem_uso: number
  fresa_sku: string
  fresa: CatalogoFresa | null
}

// ============================================================
// KITS - Tipos
// ============================================================

export interface CatalogoTipoKit {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// WORKFLOWS - Tipos e Etapas
// ============================================================

export interface CatalogoCpsTipoWorkflow {
  id: string
  nome: string
  sigla: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CatalogoCpsEtapaWorkflow {
  id: string
  tipo_workflow_id: string
  nome: string
  sigla: string | null
  ordem: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_workflow?: CatalogoCpsTipoWorkflow
}

// ============================================================
// PRODUTOS - Imagens
// ============================================================

export interface CatalogoImagemProduto {
  id: string
  produto_tipo: ProdutoTipoImagem
  produto_sku: string
  url_imagem: string
  fonte: FonteImagem
  ordem_exibicao: number
  created_at: string
}

/** @deprecated Use CatalogoImagemProduto */
export type CatalogoImagemImplante = CatalogoImagemProduto

// ============================================================
// PRODUTOS - Implantes
// ============================================================

export interface CatalogoImplante {
  sku: string
  linha_id: string
  conexao_id: string | null
  familia_id: string | null
  categoria_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  osso_soft: string | null
  osso_hard: string | null
  diametro_mm: number
  comprimento_mm: number
  rosca_interna: string | null
  regiao_apical: string | null
  regiao_cervical: string | null
  torque_insercao: number | null
  diametro_plataforma_mm: number | null
  macrogeometria: string | null
  material: string | null
  superficie: string | null
  detalhes_extras: Record<string, unknown>
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  linha?: CatalogoIpsLinha
  conexao?: CatalogoIpsConexao
  familia?: CatalogoIpsFamilia
  imagens?: CatalogoImagemProduto[]
  chaves?: CatalogoChave[]
  protocolo_soft?: CatalogoProtocoloFresagem
  protocolo_hard?: CatalogoProtocoloFresagem
}

export interface CatalogoAbutment {
  sku: string
  familia_id?: string
  tipo_reabilitacao_id?: string
  tipo_abutment_id: string
  parafuso_id: string | null
  chave_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  diametro_plataforma_mm: number | null
  altura_transmucoso_mm: number | null
  altura_corpo_mm: number | null
  angulacao_graus: number | null
  torque_ncm: number | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_abutment?: CatalogoCpsTipoAbutment
  familia?: CatalogoIpsFamilia
  parafuso?: CatalogoParafuso
  chave?: CatalogoChave
  imagens?: CatalogoImagemProduto[]
}

export interface CatalogoComponente {
  sku: string
  tipo_componente_id: string | null
  tipo_abutment_id: string | null
  parafuso_id: string | null
  chave_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  diametro_plataforma_mm: number | null
  altura_transmucoso_mm: number | null
  altura_corpo_mm: number | null
  angulacao_graus: number | null
  tipo: string | null
  tipo_travamento: string | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_componente?: CatalogoCpsTipoComponente
  tipo_abutment?: CatalogoCpsTipoAbutment
  parafuso?: CatalogoParafuso
  chave?: CatalogoChave
  imagens?: CatalogoImagemProduto[]
}

export interface CatalogoParafuso {
  sku: string
  tipo_parafuso_id: string | null
  chave_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  torque_ncm: number | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_parafuso?: CatalogoCpsTipoParafuso
  chave?: CatalogoChave
  imagens?: CatalogoImagemProduto[]
}

/** @deprecated Use CatalogoParafuso */
export type CatalogoParafusoRetencao = CatalogoParafuso

export interface CatalogoCicatrizador {
  sku: string
  implante_id: string | null
  chave_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  diametro_plataforma_mm: number | null
  altura_transmucoso_mm: number | null
  altura_corpo_mm: number | null
  torque_ncm: number | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  implante?: CatalogoImplante
  chave?: CatalogoChave
  imagens?: CatalogoImagemProduto[]
}

export interface CatalogoChave {
  sku: string
  tipo_chave_id: string | null
  kit_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  tipo: string | null
  comprimento: string | null
  diametro_mm: number | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_chave?: CatalogoTipoChave
  imagens?: CatalogoImagemProduto[]
}
export interface CatalogoFresa {
  sku: string
  tipo_fresa_id: string | null
  kit_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  tipo: string | null
  comprimento: string | null
  diametro_mm: number | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_fresa?: CatalogoTipoFresa
  imagens?: CatalogoImagemProduto[]
}
export interface CatalogoComplementar {
  sku: string
  tipo_complementar_id: string | null
  kit_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  tipo: string | null
  comprimento: string | null
  diametro_mm: number | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_complementar?: CatalogoTipoComplementar
  imagens?: CatalogoImagemProduto[]
}
export interface CatalogoOpcional {
  sku: string
  tipo_opcional_id: string | null
  kit_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  tipo: string | null
  comprimento: string | null
  diametro_mm: number | null
  material: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_opcional?: CatalogoTipoOpcional
  imagens?: CatalogoImagemProduto[]
}

// ============================================================
// KITS - Produto
// ============================================================
export interface CatalogoKit {
  sku: string
  tipo_kit_id: string | null
  nome: string
  sigla: string | null
  descricao: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
  created_at: string
  updated_at: string
  tipo_kit?: CatalogoTipoKit
  chaves?: CatalogoChave[]
  fresas?: CatalogoFresa[]
  complementares?: CatalogoComplementar[]
  opcionais?: CatalogoOpcional[]
  imagens?: CatalogoImagemProduto[]
}

/** @deprecated Use CatalogoKit with tipo_kit_id */
export type CatalogoCategoriaKit = CatalogoTipoKit

// ============================================================
// PIVOT TABLES - N:M
// ============================================================

export interface CatalogoImplanteChave {
  implante_sku: string
  chave_id: string
}

export interface CatalogoKitChave {
  kit_sku: string
  chave_id: string
}

export interface CatalogoKitFresa {
  kit_sku: string
  fresa_id: string
}

export interface CatalogoKitComplementar {
  kit_sku: string
  complementar_id: string
}

export interface CatalogoKitOpcional {
  kit_sku: string
  opcional_id: string
}

export interface CatalogoImplanteKit {
  implante_sku: string
  kit_sku: string
}

export interface CatalogoImplanteAbutment {
  implante_sku: string
  abutment_sku: string
}

// ============================================================
// COMERCIAL
// ============================================================

export interface CatalogoCupom {
  id: string
  codigo: string
  tipo: "percentual" | "fixo"
  valor: number
  validade: string | null
  ativo: boolean
  grupo_id: string | null
  created_at: string
  updated_at: string
}

export type LinkTesteNivelAcesso = "visitante" | "logado"

export interface CatalogoLinkTeste {
  id: string
  token: string
  nivel_acesso: LinkTesteNivelAcesso
  descricao: string | null
  ativo: boolean
  expires_at: string | null
  max_usos: number | null
  usos: number
  created_by: string | null
  created_at: string
}

export interface CatalogoFrete {
  id: string
  cep_inicio: string
  cep_fim: string
  valor: number
  prazo_dias: number
  created_at: string
  updated_at: string
}

export interface CatalogoPromocional {
  id: string
  nome: string
  descricao: string | null
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  expira_em: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  itens?: CatalogoPromocionalItem[]
}

export interface CatalogoPromocionalItem {
  id: string
  promocional_id: string
  sku: string
  tipo: string
  created_at: string
}

// ============================================================
// UI TYPES
// ============================================================

export interface ProductSheetResult {
  tipo: ProductSheetTipo
  sku: string
  nome: string
  subtitulo: string
  cor: string
  specs: { label: string; value: string }[]
  imagens: string[]
  fullRoute: string
}

export interface CartItem {
  sku: string
  nome: string
  tipo: ProductSheetTipo
  cor: string
  preco: number
  quantidade: number
  /** Quantidade disponível em estoque (null = sem controle) */
  qtd_disponivel: number | null
  /** Quantidade mínima para exibir alerta de estoque baixo */
  qtd_minima_aviso: number | null
  meta?: Record<string, unknown>
}

export const CATALOGO_TIPO_LABEL: Record<ProductSheetTipo, string> = {
  implante: "Implante",
  abutment: "Abutment",
  kit: "Kit",
  fresa: "Fresa",
  chave: "Chave",
  complementar: "Complementar",
  opcional: "Opcional",
  componente: "Componente",
  parafuso: "Parafuso",
  cicatrizador: "Cicatrizador",
  acessorio: "Acessório",
  instrumental: "Instrumental",
  promocional: "Promocional",
}

// ============================================================
// DEPRECATED ALIASES (manter compatibilidade temporária)
// ============================================================

/** @deprecated Use CatalogoIpsConexao */
export type CatalogoConexao = CatalogoIpsConexao
/** @deprecated Use CatalogoIpsFamilia */
export type CatalogoFamilia = CatalogoIpsFamilia
/** @deprecated Use CatalogoIpsLinha */
export type CatalogoLinha = CatalogoIpsLinha
/** @deprecated Use CatalogoCpsTipoReabilitacao */
export type CatalogoTipoReabilitacao = CatalogoCpsTipoReabilitacao
/** @deprecated Use CatalogoCpsTipoAbutment */
export type CatalogoTipoAbutment = CatalogoCpsTipoAbutment
/** @deprecated Use CatalogoCpsTipoWorkflow */
export type CatalogoWorkflow = CatalogoCpsTipoWorkflow
/** @deprecated Use CatalogoCpsEtapaWorkflow */
export type CatalogoEtapaWorkflow = CatalogoCpsEtapaWorkflow
/** @deprecated Removed */
export type CatalogoSequenciaProtetica = Record<string, unknown>
/** @deprecated Removed */
export type CatalogoCategoriaAcessorio = Record<string, unknown>
/** @deprecated Placeholder — campos mínimos p/ AbutmentForm */
export type CatalogoAcessorio = {
  id?: string
  sku: string
  nome: string
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
} & Record<string, unknown>
/** @deprecated Removed */
export type CatalogoAcessorioFerramental = Record<string, unknown>
/** @deprecated Removed */
export type CatalogoCategoriaInstrumental = Record<string, unknown>
/** @deprecated Placeholder — campos mínimos p/ picker de produtos */
export type CatalogoInstrumentalGeral = {
  id?: string
  sku: string
  nome: string
  preco: number
  preco_euro: number
  preco_dolar: number
  qtd_disponivel: number
  qtd_minima_aviso: number
  ativo: boolean
} & Record<string, unknown>
/** @deprecated Removed */
export type CatalogoGuiaReabilitacao = Record<string, unknown>
/** @deprecated Removed */
export type CatalogoKitFamilia = Record<string, unknown>
/** @deprecated Removed */
export type CatalogoKitComposicao = Record<string, unknown>
/** @deprecated Removed */
export type BOMItem = Record<string, unknown>
export type BOMItemTipo = "fresa" | "chave" | "complementar" | "opcional" | "implante" | "parafuso" | "cicatrizador" | "componente"
