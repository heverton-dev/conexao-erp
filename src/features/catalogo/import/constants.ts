import type { ImportType } from "./types"

// ============================================================
// Tipos de configuração
// ============================================================

export interface TargetFieldConfig {
  key: string
  label: string
  required: boolean
  type: "string" | "number" | "boolean" | "list"
  transform?: { type: string; values?: string[] }
  example: string
}

/**
 * Resolve um nome/SKU vindo da planilha para o id (uuid) de uma tabela
 * relacionada, criando o registro se `createIfMissing` e não existir.
 * `scopeField`, quando presente, restringe a busca/criação ao escopo do
 * pai já resolvido (ex: conexão só é buscada dentro da categoria certa).
 */
export interface FkResolverConfig {
  targetField: string
  sourceField: string
  lookupTable: string
  matchField: string
  createIfMissing: boolean
  required: boolean
  scopeField?: { column: string; fromResolved: string }
  extraCreateFields?: (
    row: Record<string, unknown>,
    resolvedIds: Record<string, string>,
  ) => Record<string, unknown>
}

/** Coluna de lista (`;`-separada) que vira linhas numa tabela pivot N:M. */
export interface ListPivotConfig {
  sourceField: string
  pivotTable: string
  ownKeyField: string
  /** De onde vem o valor da própria entidade a gravar na pivot. */
  ownKeyFrom: "sku" | "id"
  refField: string
  refLookupTable?: string
  refMatchField?: string
  orderField?: string
}

export interface ImportTypeConfig {
  label: string
  description: string
  icon: string
  targetFields: TargetFieldConfig[]
  dependencies: ImportType[]
  supabaseTable: string
  uniqueKey: string[]
  uniqueKeyHasDbConstraint: boolean
  fkResolvers: FkResolverConfig[]
  listPivots?: ListPivotConfig[]
  skipMainUpsert?: boolean
  buildRecord?: (row: Record<string, unknown>, resolvedIds: Record<string, string>) => Record<string, unknown>
}

// ============================================================
// Campos compartilhados
// ============================================================

const HIERARQUIA_CHAIN_FIELDS: TargetFieldConfig[] = [
  { key: "categoria_nome", label: "Categoria", required: true, type: "string", example: "Implante" },
  { key: "conexao_nome", label: "Conexão", required: true, type: "string", example: "Conical" },
  { key: "conexao_sigla", label: "Sigla Conexão", required: false, type: "string", example: "CON" },
  { key: "familia_nome", label: "Família", required: true, type: "string", example: "Tornillo" },
  { key: "familia_cor", label: "Cor Família", required: false, type: "string", example: "#c9a655" },
  { key: "linha_nome", label: "Linha", required: true, type: "string", example: "Standard" },
]

const HIERARQUIA_FK_RESOLVERS: FkResolverConfig[] = [
  {
    targetField: "categoria_id",
    sourceField: "categoria_nome",
    lookupTable: "catalogo_categorias",
    matchField: "nome",
    createIfMissing: true,
    required: true,
    extraCreateFields: (row) => ({ nome: String(row.categoria_nome ?? "").trim(), ativo: true }),
  },
  {
    targetField: "conexao_id",
    sourceField: "conexao_nome",
    lookupTable: "catalogo_ips_conexoes",
    matchField: "nome",
    createIfMissing: true,
    required: true,
    scopeField: { column: "categoria_id", fromResolved: "categoria_id" },
    extraCreateFields: (row, resolved) => ({
      nome: String(row.conexao_nome ?? "").trim(),
      categoria_id: resolved.categoria_id,
      sigla: row.conexao_sigla ? String(row.conexao_sigla).trim() : String(row.conexao_nome ?? "").trim().slice(0, 10),
      locked: true,
      ativo: true,
    }),
  },
  {
    targetField: "familia_id",
    sourceField: "familia_nome",
    lookupTable: "catalogo_ips_familias",
    matchField: "nome",
    createIfMissing: true,
    required: true,
    scopeField: { column: "conexao_id", fromResolved: "conexao_id" },
    extraCreateFields: (row, resolved) => ({
      nome: String(row.familia_nome ?? "").trim(),
      conexao_id: resolved.conexao_id,
      cor_identificacao: row.familia_cor ? String(row.familia_cor).trim() : "#c9a655",
      locked: false,
      ativo: true,
    }),
  },
  {
    targetField: "linha_id",
    sourceField: "linha_nome",
    lookupTable: "catalogo_ips_linhas",
    matchField: "nome",
    createIfMissing: true,
    required: true,
    scopeField: { column: "familia_id", fromResolved: "familia_id" },
    extraCreateFields: (row, resolved) => ({
      nome: String(row.linha_nome ?? "").trim(),
      familia_id: resolved.familia_id,
      ativo: true,
    }),
  },
]

const COMERCIAL_FIELDS: TargetFieldConfig[] = [
  { key: "preco", label: "Preço", required: false, type: "number", transform: { type: "number" }, example: "120.00" },
  { key: "ativo", label: "Ativo", required: false, type: "boolean", transform: { type: "boolean" }, example: "sim" },
]

const IDENTIFICACAO_FIELDS: TargetFieldConfig[] = [
  { key: "sku", label: "SKU", required: true, type: "string", example: "SKU-001" },
  { key: "nome", label: "Nome", required: true, type: "string", example: "Nome do item" },
  { key: "sigla", label: "Sigla", required: false, type: "string", example: "ABC" },
  { key: "descricao", label: "Descrição", required: false, type: "string", example: "Descrição do item" },
]

/** Fábrica para os 4 tipos "instrumentais" (chaves/fresas/complementares/opcionais) — mesmo shape. */
function buildInstrumentalConfig(opts: {
  label: string
  description: string
  icon: string
  supabaseTable: string
  tipoField: string
  tipoLookupTable: string
}): ImportTypeConfig {
  return {
    label: opts.label,
    description: opts.description,
    icon: opts.icon,
    supabaseTable: opts.supabaseTable,
    uniqueKey: ["sku"],
    uniqueKeyHasDbConstraint: true,
    dependencies: [],
    fkResolvers: [
      {
        targetField: opts.tipoField,
        sourceField: `${opts.tipoField.replace(/_id$/, "")}_nome`,
        lookupTable: opts.tipoLookupTable,
        matchField: "nome",
        createIfMissing: true,
        required: false,
        extraCreateFields: (row) => ({
          nome: String(row[`${opts.tipoField.replace(/_id$/, "")}_nome`] ?? "").trim(),
          ativo: true,
        }),
      },
    ],
    targetFields: [
      { key: `${opts.tipoField.replace(/_id$/, "")}_nome`, label: "Tipo", required: false, type: "string", example: "Padrão" },
      ...IDENTIFICACAO_FIELDS,
      { key: "tipo", label: "Tipo (texto livre)", required: false, type: "string", example: "Cirúrgico" },
      { key: "comprimento", label: "Comprimento", required: false, type: "string", example: "25mm" },
      { key: "diametro_mm", label: "Diâmetro (mm)", required: false, type: "number", transform: { type: "number" }, example: "2.3" },
      { key: "material", label: "Material", required: false, type: "string", example: "Titânio" },
      ...COMERCIAL_FIELDS,
    ],
    buildRecord: (row, resolved) => ({
      [opts.tipoField]: resolved[opts.tipoField] ?? null,
      sku: row.sku,
      nome: row.nome,
      sigla: row.sigla ?? null,
      descricao: row.descricao ?? null,
      tipo: row.tipo ?? null,
      comprimento: row.comprimento ?? null,
      diametro_mm: row.diametro_mm ?? null,
      material: row.material ?? null,
      preco: row.preco ?? null,
      ativo: row.ativo !== false,
    }),
  }
}

// ============================================================
// Configs
// ============================================================

export const IMPORT_FIELD_CONFIGS: Record<ImportType, ImportTypeConfig> = {
  hierarquia: {
    label: "Hierarquia",
    description: "Categorias, Conexões, Famílias e Linhas",
    icon: "Network",
    dependencies: [],
    supabaseTable: "catalogo_ips_linhas",
    uniqueKey: ["nome"],
    uniqueKeyHasDbConstraint: false,
    skipMainUpsert: true,
    fkResolvers: HIERARQUIA_FK_RESOLVERS,
    targetFields: [...HIERARQUIA_CHAIN_FIELDS],
  },

  implantes: {
    label: "Implantes",
    description: "SKUs de implantes com dimensões e preço",
    icon: "CircleDot",
    dependencies: ["hierarquia"],
    supabaseTable: "catalogo_implantes",
    uniqueKey: ["sku"],
    uniqueKeyHasDbConstraint: true,
    fkResolvers: [
      ...HIERARQUIA_FK_RESOLVERS,
      {
        targetField: "osso_soft",
        sourceField: "osso_soft_nome",
        lookupTable: "catalogo_protocolos_fresagens",
        matchField: "nome",
        createIfMissing: false,
        required: false,
      },
      {
        targetField: "osso_hard",
        sourceField: "osso_hard_nome",
        lookupTable: "catalogo_protocolos_fresagens",
        matchField: "nome",
        createIfMissing: false,
        required: false,
      },
    ],
    targetFields: [
      ...HIERARQUIA_CHAIN_FIELDS,
      { key: "sku", label: "SKU", required: true, type: "string", example: "IMP-CON-TOR-001" },
      { key: "nome", label: "Nome", required: true, type: "string", example: "Implante Cônico 4.0x10" },
      { key: "sigla", label: "Sigla", required: false, type: "string", example: "ICT" },
      { key: "descricao", label: "Descrição", required: false, type: "string", example: "" },
      { key: "osso_soft_nome", label: "Protocolo Osso Soft", required: false, type: "string", example: "Protocolo Soft I" },
      { key: "osso_hard_nome", label: "Protocolo Osso Hard", required: false, type: "string", example: "Protocolo Hard I" },
      { key: "diametro_mm", label: "Diâmetro (mm)", required: true, type: "number", transform: { type: "number" }, example: "4.0" },
      { key: "comprimento_mm", label: "Comprimento (mm)", required: true, type: "number", transform: { type: "number" }, example: "10" },
      { key: "rosca_interna", label: "Rosca Interna", required: false, type: "string", example: "Hex" },
      { key: "regiao_apical", label: "Região Apical", required: false, type: "string", example: "" },
      { key: "regiao_cervical", label: "Região Cervical", required: false, type: "string", example: "" },
      { key: "torque_insercao", label: "Torque Inserção", required: false, type: "number", transform: { type: "number" }, example: "35" },
      { key: "macrogeometria", label: "Macrogeometria", required: false, type: "string", example: "" },
      { key: "material", label: "Material", required: false, type: "string", example: "Titânio Grau 5" },
      { key: "superficie", label: "Superfície", required: false, type: "string", example: "" },
      ...COMERCIAL_FIELDS,
    ],
    buildRecord: (row, resolved) => ({
      conexao_id: resolved.conexao_id,
      familia_id: resolved.familia_id,
      linha_id: resolved.linha_id,
      sku: row.sku,
      nome: row.nome,
      sigla: row.sigla ?? null,
      descricao: row.descricao ?? null,
      osso_soft: resolved.osso_soft ?? null,
      osso_hard: resolved.osso_hard ?? null,
      diametro_mm: row.diametro_mm,
      comprimento_mm: row.comprimento_mm,
      rosca_interna: row.rosca_interna ?? null,
      regiao_apical: row.regiao_apical ?? null,
      regiao_cervical: row.regiao_cervical ?? null,
      torque_insercao: row.torque_insercao ?? null,
      macrogeometria: row.macrogeometria ?? null,
      material: row.material ?? null,
      superficie: row.superficie ?? null,
      preco: row.preco ?? null,
      ativo: row.ativo !== false,
    }),
  },

  abutments: {
    label: "Abutments",
    description: "Abutments com tipo e vinculações opcionais",
    icon: "Component",
    dependencies: [],
    supabaseTable: "catalogo_abutments",
    uniqueKey: ["sku"],
    uniqueKeyHasDbConstraint: true,
    fkResolvers: [
      {
        targetField: "tipo_abutment_id",
        sourceField: "tipo_abutment_nome",
        lookupTable: "catalogo_cps_tipos_abutments",
        matchField: "nome",
        createIfMissing: true,
        required: true,
        extraCreateFields: (row) => ({ nome: String(row.tipo_abutment_nome ?? "").trim(), ativo: true }),
      },
      { targetField: "parafuso_id", sourceField: "parafuso_sku", lookupTable: "catalogo_parafusos", matchField: "sku", createIfMissing: false, required: false },
      { targetField: "chave_id", sourceField: "chave_sku", lookupTable: "catalogo_chaves", matchField: "sku", createIfMissing: false, required: false },
    ],
    targetFields: [
      { key: "tipo_abutment_nome", label: "Tipo Abutment", required: true, type: "string", example: "MU" },
      { key: "parafuso_sku", label: "SKU Parafuso", required: false, type: "string", example: "PAR-001" },
      { key: "chave_sku", label: "SKU Chave", required: false, type: "string", example: "CHA-001" },
      ...IDENTIFICACAO_FIELDS,
      { key: "diametro_plataforma_mm", label: "Diâmetro Plataforma (mm)", required: false, type: "number", transform: { type: "number" }, example: "3.5" },
      { key: "altura_transmucoso_mm", label: "Altura Transmucoso (mm)", required: false, type: "number", transform: { type: "number" }, example: "2.0" },
      { key: "altura_corpo_mm", label: "Altura Corpo (mm)", required: false, type: "number", transform: { type: "number" }, example: "5.0" },
      { key: "angulacao_graus", label: "Angulação (graus)", required: false, type: "number", transform: { type: "number" }, example: "15" },
      { key: "torque_ncm", label: "Torque (Ncm)", required: false, type: "number", transform: { type: "number" }, example: "20" },
      { key: "material", label: "Material", required: false, type: "string", example: "Titânio" },
      ...COMERCIAL_FIELDS,
    ],
    buildRecord: (row, resolved) => ({
      tipo_abutment_id: resolved.tipo_abutment_id,
      parafuso_id: resolved.parafuso_id ?? null,
      chave_id: resolved.chave_id ?? null,
      sku: row.sku,
      nome: row.nome,
      sigla: row.sigla ?? null,
      descricao: row.descricao ?? null,
      diametro_plataforma_mm: row.diametro_plataforma_mm ?? null,
      altura_transmucoso_mm: row.altura_transmucoso_mm ?? null,
      altura_corpo_mm: row.altura_corpo_mm ?? null,
      angulacao_graus: row.angulacao_graus ?? null,
      torque_ncm: row.torque_ncm ?? null,
      material: row.material ?? null,
      preco: row.preco ?? null,
      ativo: row.ativo !== false,
    }),
  },

  componentes: {
    label: "Componentes",
    description: "Componentes protéticos com vinculações opcionais",
    icon: "Package",
    dependencies: [],
    supabaseTable: "catalogo_componentes",
    uniqueKey: ["sku"],
    uniqueKeyHasDbConstraint: true,
    fkResolvers: [
      {
        targetField: "tipo_componente_id",
        sourceField: "tipo_componente_nome",
        lookupTable: "catalogo_cps_tipos_componentes",
        matchField: "nome",
        createIfMissing: true,
        required: false,
        extraCreateFields: (row) => ({ nome: String(row.tipo_componente_nome ?? "").trim(), ativo: true }),
      },
      {
        targetField: "tipo_abutment_id",
        sourceField: "tipo_abutment_nome",
        lookupTable: "catalogo_cps_tipos_abutments",
        matchField: "nome",
        createIfMissing: true,
        required: false,
        extraCreateFields: (row) => ({ nome: String(row.tipo_abutment_nome ?? "").trim(), ativo: true }),
      },
      { targetField: "parafuso_id", sourceField: "parafuso_sku", lookupTable: "catalogo_parafusos", matchField: "sku", createIfMissing: false, required: false },
      { targetField: "chave_id", sourceField: "chave_sku", lookupTable: "catalogo_chaves", matchField: "sku", createIfMissing: false, required: false },
    ],
    targetFields: [
      { key: "tipo_componente_nome", label: "Tipo Componente", required: false, type: "string", example: "Munhão" },
      { key: "tipo_abutment_nome", label: "Tipo Abutment", required: false, type: "string", example: "MU" },
      { key: "parafuso_sku", label: "SKU Parafuso", required: false, type: "string", example: "PAR-001" },
      { key: "chave_sku", label: "SKU Chave", required: false, type: "string", example: "CHA-001" },
      ...IDENTIFICACAO_FIELDS,
      { key: "diametro_plataforma_mm", label: "Diâmetro Plataforma (mm)", required: false, type: "number", transform: { type: "number" }, example: "3.5" },
      { key: "altura_transmucoso_mm", label: "Altura Transmucoso (mm)", required: false, type: "number", transform: { type: "number" }, example: "2.0" },
      { key: "altura_corpo_mm", label: "Altura Corpo (mm)", required: false, type: "number", transform: { type: "number" }, example: "5.0" },
      { key: "angulacao_graus", label: "Angulação (graus)", required: false, type: "number", transform: { type: "number" }, example: "0" },
      { key: "tipo", label: "Tipo (texto livre)", required: false, type: "string", example: "" },
      { key: "tipo_travamento", label: "Tipo Travamento", required: false, type: "string", example: "" },
      { key: "material", label: "Material", required: false, type: "string", example: "Titânio" },
      ...COMERCIAL_FIELDS,
    ],
    buildRecord: (row, resolved) => ({
      tipo_componente_id: resolved.tipo_componente_id ?? null,
      tipo_abutment_id: resolved.tipo_abutment_id ?? null,
      parafuso_id: resolved.parafuso_id ?? null,
      chave_id: resolved.chave_id ?? null,
      sku: row.sku,
      nome: row.nome,
      sigla: row.sigla ?? null,
      descricao: row.descricao ?? null,
      diametro_plataforma_mm: row.diametro_plataforma_mm ?? null,
      altura_transmucoso_mm: row.altura_transmucoso_mm ?? null,
      altura_corpo_mm: row.altura_corpo_mm ?? null,
      angulacao_graus: row.angulacao_graus ?? null,
      tipo: row.tipo ?? null,
      tipo_travamento: row.tipo_travamento ?? null,
      material: row.material ?? null,
      preco: row.preco ?? null,
      ativo: row.ativo !== false,
    }),
  },

  parafusos: {
    label: "Parafusos",
    description: "Parafusos de retenção/protéticos",
    icon: "Bolt",
    dependencies: [],
    supabaseTable: "catalogo_parafusos",
    uniqueKey: ["sku"],
    uniqueKeyHasDbConstraint: true,
    fkResolvers: [
      {
        targetField: "tipo_parafuso_id",
        sourceField: "tipo_parafuso_nome",
        lookupTable: "catalogo_cps_tipos_parafusos",
        matchField: "nome",
        createIfMissing: true,
        required: false,
        extraCreateFields: (row) => ({ nome: String(row.tipo_parafuso_nome ?? "").trim(), ativo: true }),
      },
      { targetField: "chave_id", sourceField: "chave_sku", lookupTable: "catalogo_chaves", matchField: "sku", createIfMissing: false, required: false },
    ],
    targetFields: [
      { key: "tipo_parafuso_nome", label: "Tipo Parafuso", required: false, type: "string", example: "Retenção Protética" },
      { key: "chave_sku", label: "SKU Chave", required: false, type: "string", example: "CHA-001" },
      ...IDENTIFICACAO_FIELDS,
      { key: "torque_ncm", label: "Torque (Ncm)", required: false, type: "number", transform: { type: "number" }, example: "20" },
      { key: "material", label: "Material", required: false, type: "string", example: "Titânio" },
      ...COMERCIAL_FIELDS,
    ],
    buildRecord: (row, resolved) => ({
      tipo_parafuso_id: resolved.tipo_parafuso_id ?? null,
      chave_id: resolved.chave_id ?? null,
      sku: row.sku,
      nome: row.nome,
      sigla: row.sigla ?? null,
      descricao: row.descricao ?? null,
      torque_ncm: row.torque_ncm ?? null,
      material: row.material ?? null,
      preco: row.preco ?? null,
      ativo: row.ativo !== false,
    }),
  },

  cicatrizadores: {
    label: "Cicatrizadores",
    description: "Cicatrizadores vinculados a implante e/ou chave",
    icon: "CircleDashed",
    dependencies: [],
    supabaseTable: "catalogo_cicatrizadores",
    uniqueKey: ["sku"],
    uniqueKeyHasDbConstraint: true,
    fkResolvers: [
      { targetField: "implante_id", sourceField: "implante_sku", lookupTable: "catalogo_implantes", matchField: "sku", createIfMissing: false, required: false },
      { targetField: "chave_id", sourceField: "chave_sku", lookupTable: "catalogo_chaves", matchField: "sku", createIfMissing: false, required: false },
    ],
    targetFields: [
      { key: "implante_sku", label: "SKU Implante", required: false, type: "string", example: "IMP-CON-TOR-001" },
      { key: "chave_sku", label: "SKU Chave", required: false, type: "string", example: "CHA-001" },
      ...IDENTIFICACAO_FIELDS,
      { key: "diametro_plataforma_mm", label: "Diâmetro Plataforma (mm)", required: false, type: "number", transform: { type: "number" }, example: "4.0" },
      { key: "altura_transmucoso_mm", label: "Altura Transmucoso (mm)", required: false, type: "number", transform: { type: "number" }, example: "3.0" },
      { key: "altura_corpo_mm", label: "Altura Corpo (mm)", required: false, type: "number", transform: { type: "number" }, example: "" },
      { key: "torque_ncm", label: "Torque (Ncm)", required: false, type: "number", transform: { type: "number" }, example: "10" },
      { key: "material", label: "Material", required: false, type: "string", example: "Titânio" },
      ...COMERCIAL_FIELDS,
    ],
    buildRecord: (row, resolved) => ({
      implante_id: resolved.implante_id ?? null,
      chave_id: resolved.chave_id ?? null,
      sku: row.sku,
      nome: row.nome,
      sigla: row.sigla ?? null,
      descricao: row.descricao ?? null,
      diametro_plataforma_mm: row.diametro_plataforma_mm ?? null,
      altura_transmucoso_mm: row.altura_transmucoso_mm ?? null,
      altura_corpo_mm: row.altura_corpo_mm ?? null,
      torque_ncm: row.torque_ncm ?? null,
      material: row.material ?? null,
      preco: row.preco ?? null,
      ativo: row.ativo !== false,
    }),
  },

  chaves: buildInstrumentalConfig({
    label: "Chaves",
    description: "Chaves ferramentais",
    icon: "Wrench",
    supabaseTable: "catalogo_chaves",
    tipoField: "tipo_chave_id",
    tipoLookupTable: "catalogo_tipos_chaves",
  }),

  fresas: buildInstrumentalConfig({
    label: "Fresas",
    description: "Fresas cirúrgicas",
    icon: "Disc",
    supabaseTable: "catalogo_fresas",
    tipoField: "tipo_fresa_id",
    tipoLookupTable: "catalogo_tipos_fresas",
  }),

  complementares: buildInstrumentalConfig({
    label: "Complementares",
    description: "Itens complementares",
    icon: "PlusSquare",
    supabaseTable: "catalogo_complementares",
    tipoField: "tipo_complementar_id",
    tipoLookupTable: "catalogo_tipos_complementares",
  }),

  opcionais: buildInstrumentalConfig({
    label: "Opcionais",
    description: "Itens opcionais",
    icon: "SlidersHorizontal",
    supabaseTable: "catalogo_opcionais",
    tipoField: "tipo_opcional_id",
    tipoLookupTable: "catalogo_tipos_opcionais",
  }),

  kits: {
    label: "Kits",
    description: "Kits com tipo e composição (chaves/fresas/complementares/opcionais/implantes)",
    icon: "Boxes",
    dependencies: [],
    supabaseTable: "catalogo_kits",
    uniqueKey: ["sku"],
    uniqueKeyHasDbConstraint: true,
    fkResolvers: [
      {
        targetField: "tipo_kit_id",
        sourceField: "tipo_kit_nome",
        lookupTable: "catalogo_tipos_kits",
        matchField: "nome",
        createIfMissing: true,
        required: false,
        extraCreateFields: (row) => ({ nome: String(row.tipo_kit_nome ?? "").trim(), ativo: true }),
      },
    ],
    listPivots: [
      { sourceField: "chaves_skus", pivotTable: "catalogo_kit_chaves", ownKeyField: "kit_sku", ownKeyFrom: "sku", refField: "chave_id", refLookupTable: "catalogo_chaves", refMatchField: "sku" },
      { sourceField: "fresas_skus", pivotTable: "catalogo_kit_fresas", ownKeyField: "kit_sku", ownKeyFrom: "sku", refField: "fresa_id", refLookupTable: "catalogo_fresas", refMatchField: "sku" },
      { sourceField: "complementares_skus", pivotTable: "catalogo_kit_complementares", ownKeyField: "kit_sku", ownKeyFrom: "sku", refField: "complementar_id", refLookupTable: "catalogo_complementares", refMatchField: "sku" },
      { sourceField: "opcionais_skus", pivotTable: "catalogo_kit_opcionais", ownKeyField: "kit_sku", ownKeyFrom: "sku", refField: "opcional_id", refLookupTable: "catalogo_opcionais", refMatchField: "sku" },
      { sourceField: "implantes_skus", pivotTable: "catalogo_kit_implantes", ownKeyField: "kit_sku", ownKeyFrom: "sku", refField: "implante_sku" },
    ],
    targetFields: [
      { key: "tipo_kit_nome", label: "Tipo Kit", required: false, type: "string", example: "Cirurgia" },
      ...IDENTIFICACAO_FIELDS,
      { key: "preco", label: "Preço", required: false, type: "number", transform: { type: "number" }, example: "2500.00" },
      { key: "ativo", label: "Ativo", required: false, type: "boolean", transform: { type: "boolean" }, example: "sim" },
      { key: "chaves_skus", label: "SKUs Chaves (;)", required: false, type: "list", example: "CHA-001;CHA-002" },
      { key: "fresas_skus", label: "SKUs Fresas (;)", required: false, type: "list", example: "FRE-001;FRE-002" },
      { key: "complementares_skus", label: "SKUs Complementares (;)", required: false, type: "list", example: "" },
      { key: "opcionais_skus", label: "SKUs Opcionais (;)", required: false, type: "list", example: "" },
      { key: "implantes_skus", label: "SKUs Implantes (;)", required: false, type: "list", example: "IMP-CON-TOR-001" },
    ],
    buildRecord: (row, resolved) => ({
      tipo_kit_id: resolved.tipo_kit_id ?? null,
      sku: row.sku,
      nome: row.nome,
      sigla: row.sigla ?? null,
      descricao: row.descricao ?? null,
      preco: row.preco ?? null,
      ativo: row.ativo !== false,
    }),
  },

  tipos_osso: {
    label: "Tipos de Osso",
    description: "Tipos de osso (hard/soft) usados nos protocolos de fresagem",
    icon: "Bone",
    dependencies: [],
    supabaseTable: "catalogo_tipos_ossos",
    uniqueKey: ["nome"],
    uniqueKeyHasDbConstraint: false,
    fkResolvers: [],
    targetFields: [
      { key: "nome", label: "Nome", required: true, type: "string", example: "Osso D2" },
      { key: "sigla", label: "Sigla", required: false, type: "string", example: "D2" },
      { key: "categoria", label: "Categoria", required: true, type: "string", transform: { type: "enum", values: ["hard", "soft"] }, example: "hard" },
      { key: "ativo", label: "Ativo", required: false, type: "boolean", transform: { type: "boolean" }, example: "sim" },
    ],
    buildRecord: (row) => ({
      nome: row.nome,
      sigla: row.sigla ?? null,
      categoria: row.categoria,
      ativo: row.ativo !== false,
    }),
  },

  protocolos_fresagem: {
    label: "Protocolos de Fresagem",
    description: "Protocolos de fresagem e sequência de fresas",
    icon: "Layers",
    dependencies: ["tipos_osso"],
    supabaseTable: "catalogo_protocolos_fresagens",
    uniqueKey: ["nome"],
    uniqueKeyHasDbConstraint: false,
    fkResolvers: [],
    listPivots: [
      {
        sourceField: "fresas_skus",
        pivotTable: "catalogo_protocolos_fresas_itens",
        ownKeyField: "protocolo_id",
        ownKeyFrom: "id",
        refField: "fresa_id",
        refLookupTable: "catalogo_fresas",
        refMatchField: "sku",
        orderField: "ordem",
      },
    ],
    targetFields: [
      { key: "nome", label: "Nome", required: true, type: "string", example: "Protocolo D2 Padrão" },
      { key: "tipo_osso", label: "Sigla Tipo de Osso", required: true, type: "string", example: "D2" },
      { key: "sigla", label: "Sigla", required: false, type: "string", example: "" },
      { key: "diametro_mm_aplicavel", label: "Diâmetro Aplicável (mm)", required: false, type: "number", transform: { type: "number" }, example: "4.0" },
      { key: "ativo", label: "Ativo", required: false, type: "boolean", transform: { type: "boolean" }, example: "sim" },
      { key: "fresas_skus", label: "SKUs Fresas em ordem (;)", required: false, type: "list", example: "FRE-001;FRE-002;FRE-003" },
    ],
    buildRecord: (row) => ({
      nome: row.nome,
      tipo_osso: row.tipo_osso,
      sigla: row.sigla ?? null,
      diametro_mm_aplicavel: row.diametro_mm_aplicavel ?? null,
      ativo: row.ativo !== false,
    }),
  },

  tipos_workflow: {
    label: "Tipos de Workflow",
    description: "Tipos de workflow protético",
    icon: "GitBranch",
    dependencies: [],
    supabaseTable: "catalogo_cps_tipos_workflows",
    uniqueKey: ["nome"],
    uniqueKeyHasDbConstraint: false,
    fkResolvers: [],
    targetFields: [
      { key: "nome", label: "Nome", required: true, type: "string", example: "Reabilitação Superior" },
      { key: "sigla", label: "Sigla", required: false, type: "string", example: "" },
      { key: "ativo", label: "Ativo", required: false, type: "boolean", transform: { type: "boolean" }, example: "sim" },
    ],
    buildRecord: (row) => ({
      nome: row.nome,
      sigla: row.sigla ?? null,
      ativo: row.ativo !== false,
    }),
  },

  etapas_workflow: {
    label: "Etapas de Workflow",
    description: "Etapas de um tipo de workflow (já existente)",
    icon: "ListOrdered",
    dependencies: ["tipos_workflow"],
    supabaseTable: "catalogo_cps_etapas_workflows",
    uniqueKey: ["tipo_workflow_id", "nome"],
    uniqueKeyHasDbConstraint: false,
    fkResolvers: [
      {
        targetField: "tipo_workflow_id",
        sourceField: "tipo_workflow_nome",
        lookupTable: "catalogo_cps_tipos_workflows",
        matchField: "nome",
        createIfMissing: false,
        required: true,
      },
    ],
    targetFields: [
      { key: "tipo_workflow_nome", label: "Tipo Workflow", required: true, type: "string", example: "Reabilitação Superior" },
      { key: "nome", label: "Nome Etapa", required: true, type: "string", example: "Impressão" },
      { key: "sigla", label: "Sigla", required: false, type: "string", example: "" },
      { key: "ordem", label: "Ordem", required: true, type: "number", transform: { type: "number" }, example: "1" },
      { key: "ativo", label: "Ativo", required: false, type: "boolean", transform: { type: "boolean" }, example: "sim" },
    ],
    buildRecord: (row, resolved) => ({
      tipo_workflow_id: resolved.tipo_workflow_id,
      nome: row.nome,
      sigla: row.sigla ?? null,
      ordem: row.ordem,
      ativo: row.ativo !== false,
    }),
  },

  promocionais: {
    label: "Promoções",
    description: "Pacotes promocionais e itens inclusos",
    icon: "Tag",
    dependencies: [],
    supabaseTable: "catalogo_promocionais",
    uniqueKey: ["nome"],
    uniqueKeyHasDbConstraint: false,
    fkResolvers: [],
    targetFields: [
      { key: "nome", label: "Nome", required: true, type: "string", example: "Combo Cirurgia Completa" },
      { key: "descricao", label: "Descrição", required: false, type: "string", example: "" },
      { key: "preco", label: "Preço", required: true, type: "number", transform: { type: "number" }, example: "3500.00" },
      { key: "expira_em", label: "Expira em (AAAA-MM-DD)", required: false, type: "string", example: "" },
      { key: "ativo", label: "Ativo", required: false, type: "boolean", transform: { type: "boolean" }, example: "sim" },
      { key: "itens", label: "Itens (tipo:sku;tipo:sku)", required: false, type: "list", example: "implante:IMP-CON-TOR-001;kit:KIT-001" },
    ],
    buildRecord: (row) => ({
      nome: row.nome,
      descricao: row.descricao ?? null,
      preco: row.preco,
      expira_em: row.expira_em || null,
      ativo: row.ativo !== false,
    }),
  },
}

/** Chaves de tipo válidas para a coluna `itens` de promocionais (ver promocionais.service.ts). */
export const PROMOCIONAL_ITEM_TIPOS = [
  "implante", "abutment", "kit", "parafuso", "cicatrizador", "chave",
  "fresa", "complementar", "opcional", "componente",
] as const

export const IMPORT_TYPES: ImportType[] = [
  "hierarquia", "implantes", "abutments", "componentes", "parafusos", "cicatrizadores",
  "chaves", "fresas", "complementares", "opcionais", "kits",
  "tipos_osso", "protocolos_fresagem", "tipos_workflow", "etapas_workflow", "promocionais",
]

export const IMPORT_TYPE_LABELS: Record<ImportType, string> = IMPORT_TYPES.reduce(
  (acc, type) => {
    acc[type] = IMPORT_FIELD_CONFIGS[type].label
    return acc
  },
  {} as Record<ImportType, string>,
)

/** Ordem de execução do modo GLOBAL — respeita dependências entre entidades. */
export const GLOBAL_IMPORT_ORDER: ImportType[] = [
  "hierarquia",
  "tipos_osso",
  "chaves", "fresas", "complementares", "opcionais",
  "protocolos_fresagem",
  "implantes",
  "parafusos",
  "abutments",
  "componentes",
  "cicatrizadores",
  "kits",
  "tipos_workflow",
  "etapas_workflow",
  "promocionais",
]

/** Grupos usados para plugar o `ImportTrigger` nas páginas admin. */
export const IMPORT_TYPE_GROUPS: Record<string, ImportType[]> = {
  implantes: ["hierarquia", "implantes"],
  componentes: ["abutments", "componentes", "parafusos", "cicatrizadores"],
  instrumentais: ["chaves", "fresas", "complementares", "opcionais"],
  kits: ["kits"],
  fresagens: ["tipos_osso", "protocolos_fresagem"],
  workflows: ["tipos_workflow", "etapas_workflow"],
  promocionais: ["promocionais"],
}
