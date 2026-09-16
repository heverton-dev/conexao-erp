// Blocklist de tabelas que NUNCA devem ser acessíveis por agentes IA
// Regra indestrutível: dados sensíveis são bloqueados server-side e client-side

export const BLOCKED_TABLES = [
  // Dados pessoais / documentos
  "profiles",
  "cadastro_documentos",
  "cadastro_documento_images",
  "cadastro_documento_verificacoes",

  // Credenciais e autenticação
  "credenciais",
  "credenciais_api",
  "empresa_limites_modulo",

  // Pagamentos e financeiro sensível
  "despesas_pagamentos",
  "despesas_envios",

  // Dados de acesso / segurança
  "user_roles",
  "user_permissions",
  "audit_log",
  "login_history",

  // Tabelas internas do sistema
  "migrations",
  "schema_migrations",
  "supabase_migrations",

  // Agentes (meta-dados sensíveis)
  "agentes_ia",
  "agentes_knowledge_docs",
  "agentes_knowledge_tabelas",
  "agentes_conversas",

  // Notificações (podem conter dados pessoais)
  "notificacoes",

  // Configurações sensíveis
  "empresa_config",
  "system_config",
] as const;

// Campos sensíveis que devem ser ocultados mesmo em tabelas permitidas
export const BLOCKED_FIELDS: Record<string, string[]> = {
  cadastros: [
    "cpf", "cnpj", "rg", "orgao_emissor", "data_nascimento",
    "nome_mae", "nome_pai", "senha", "token", "refresh_token",
  ],
  empresas: [
    "cnpj", "inscricao_estadual", "inscricao_municipal", "senha", "token",
  ],
  hub_progresso: ["usuario_id", "tokens_ganhos", "dados_pessoais"],
  crm_clientes: ["cpf", "cnpj", "rg"],
  crm_visitas: ["dados_gps", "localizacao_precisa"],
  rotas_pontos: ["coordenadas_precisas", "endereco_completo"],
  rotas: ["endereco_completo", "coordenadas"],
  catalogo_produtos: ["preco_custo", "margem_lucro", "fornecedor_cnpj"],
} as const;

// Limites por tipo de usuário
export const LIMITES_AGENTES = {
  super_admin: {
    maxArquivos: Infinity,
    maxTamanhoArquivo: Infinity, // sem limite
    podeCriarGlobal: true,       // agentes que envolvem toda a plataforma
    podeVerTodasEmpresas: true,
  },
  admin: {
    maxArquivos: 10,
    maxTamanhoArquivo: 10 * 1024 * 1024, // 10MB
    podeCriarGlobal: false,
    podeVerTodasEmpresas: false,
  },
  usuario: {
    maxArquivos: 10,
    maxTamanhoArquivo: 10 * 1024 * 1024, // 10MB
    podeCriarGlobal: false,
    podeVerTodasEmpresas: false,
  },
} as const;

export type LimiteType = keyof typeof LIMITES_AGENTES;
export type LimitesObj = {
  maxArquivos: number;
  maxTamanhoArquivo: number;
  podeCriarGlobal: boolean;
  podeVerTodasEmpresas: boolean;
};

// Função para obter limites do usuário
export function getLimitesUsuario(isSuperAdmin: boolean): LimitesObj {
  return isSuperAdmin ? LIMITES_AGENTES.super_admin : LIMITES_AGENTES.usuario;
}

// Função para verificar se uma tabela é segura
export function isTableAllowed(tabelaNome: string): boolean {
  return !BLOCKED_TABLES.includes(tabelaNome as any);
}

// Função para obter campos permitidos de uma tabela
export function getAllowedFields(
  tabelaNome: string,
  allFields: string[]
): string[] {
  const blocked = BLOCKED_FIELDS[tabelaNome] ?? [];
  return allFields.filter((f) => !blocked.includes(f));
}

// Função para sanitizar dados antes de enviar ao agente
export function sanitizeData(
  tabelaNome: string,
  data: Record<string, any>[]
): Record<string, any>[] {
  if (data.length === 0) return data;

  const allFields = Object.keys(data[0]);
  const allowedFields = getAllowedFields(tabelaNome, allFields);

  return data.map((row) => {
    const sanitized: Record<string, any> = {};
    for (const field of allowedFields) {
      sanitized[field] = row[field];
    }
    return sanitized;
  });
}

// Função para validar se uma query é segura
export function isQuerySafe(query: string): boolean {
  const lower = query.toLowerCase();

  for (const table of BLOCKED_TABLES) {
    if (lower.includes(table.toLowerCase())) {
      return false;
    }
  }

  const dangerousPatterns = [
    "drop", "truncate", "delete", "update", "insert",
    "alter", "create", "grant", "revoke",
  ];

  for (const pattern of dangerousPatterns) {
    if (lower.includes(pattern)) {
      return false;
    }
  }

  return true;
}
