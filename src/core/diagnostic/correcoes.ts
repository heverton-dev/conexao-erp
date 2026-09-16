import type { Correcao } from "./tipos";

const TABLE_ALIASES: Record<string, string> = {
  clientes: "cadastros/clientes", visitas: "crm/visitas",
  mapas_distribuidores: "mapas", mapas_consultores: "mapas",
  mktg_utms: "marketing/UTMs", mktg_pixels: "marketing/Pixels",
  mktg_calendario: "marketing/Calendário", mktg_landing_pages: "marketing/Landing Pages",
  mktg_landing_pages_versoes: "marketing/Landing Pages",
  mktg_meta_posts: "marketing/Meta BM", mktg_meta_campanhas: "marketing/Meta BM",
  mktg_meta_contas: "marketing/Meta BM",
  funis: "funis", funis_colunas: "funis", funis_tarefas: "funis",
  despesas: "despesas", despesas_tipos: "despesas", despesas_periodos: "despesas",
  despesas_envios: "despesas", despesas_pagamentos: "despesas",
  nps_perguntas: "NPS", nps_respostas: "NPS",
  hub_materiais: "Hub", hub_colecoes: "Hub", hub_progresso_usuario: "Hub",
  linktree_empresa_config: "LinkTree", linktree_empresa_sections: "LinkTree",
  linktree_empresa_links: "LinkTree",
  gerador_links: "Links", gerador_modelos: "Links",
  rotas: "Rotas",
};

function identificarTabela(msg: string): string | undefined {
  const m = msg.match(/relation\s+\"?(\w+)\"?\s+does not exist/i);
  if (m) return m[1];
  const m2 = msg.match(/insert into\s+\"?(\w+)\"?/i);
  if (m2) return m2[1];
  const m3 = msg.match(/update\s+\"?(\w+)\"?/i);
  if (m3) return m3[1];
  const m4 = msg.match(/from\s+\"?(\w+)\"?/i);
  if (m4) return m4[1];
  const m5 = msg.match(/foreign key constraint.*\"?(\w+)\"?\.\"?(\w+)\"?/i);
  if (m5) return m5[2] || m5[1];
  return undefined;
}

function extrairTabela(msg: string): string {
  const t = identificarTabela(msg);
  if (!t) return "desconhecida";
  return TABLE_ALIASES[t] ?? t;
}

function extrairNomeColuna(msg: string): string | undefined {
  const m = msg.match(/column\s+"?(\w+)"?/i);
  return m?.[1];
}

function extrairNomeConstraint(msg: string): string | undefined {
  const m = msg.match(/constraint\s+"?(\w+)"?/i);
  return m?.[1];
}

const REPLACEMENTS: [RegExp, string][] = [
  [/could not find the '(\w+)' column of '(\w+)' in the schema cache/i, "coluna '$1' da tabela '$2' não encontrada no cache de schema"],
  [/relation\s+"?(\w+)"?\s+does not exist/i, "relação '$1' não existe no banco de dados"],
  [/column\s+"?(\w+)"?\s+of\s+"?(\w+)"?\s+does not exist/i, "coluna '$1' da tabela '$2' não existe"],
  [/column\s+"?([\w.]+)"?\s+does not exist/i, "coluna '$1' não existe"],
  [/violates foreign key constraint\s+"?(\w+)"?/i, "viola constraint de chave estrangeira '$1'"],
  [/insert or update on table\s+"?(\w+)"?\s+violates foreign key constraint/i, "INSERT/UPDATE na tabela '$1' viola chave estrangeira"],
  [/violates unique constraint\s+"?(\w+)"?/i, "viola constraint única '$1'"],
  [/duplicate key value violates unique constraint/i, "valor duplicado viola constraint única"],
  [/new row for relation\s+"?(\w+)"?\s+violates row-level security/i, "linha na tabela '$1' viola política de segurança RLS"],
  [/new row violates row-level security/i, "linha viola política de segurança RLS"],
  [/permission denied for (\w+) (\w+)/i, "permissão negada para $1 '$2'"],
  [/new row for relation\s+"?(\w+)"?\s+violates/i, "linha na tabela '$1' viola restrição"],
  [/null value in column\s+"?(\w+)"?\s+violates not-null constraint/i, "valor nulo na coluna '$1' viola restrição NOT NULL"],
  [/type\s+"?(\w+)"?\s+does not exist/i, "tipo '$1' não existe"],
  [/function\s+([\w.]+)\s*\(.*\)\s+does not exist/i, "função '$1' não existe"],
  [/schema\s+"?(\w+)"?\s+(not found|does not exist)/i, "schema '$1' não encontrado"],
  [/failed to fetch/i, "falha na conexão de rede"],
  [/networkerror/i, "erro de rede"],
  [/jwt (invalid|malformed|expired)/i, "token JWT $1"],
  [/unauthorized/i, "não autorizado"],
  [/not authenticated/i, "não autenticado"],
  [/timeout expired/i, "timeout expirado"],
  [/could not find/i, "não foi possível encontrar"],
  [/does not exist/i, "não existe"],
  [/is not present in table/i, "não está presente na tabela"],
  [/canceling statement due to conflict/i, "operação cancelada devido a conflito"],
];

export function traduzirErro(msg: string): string {
  let result = msg;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function gerarCorrecoes(errorMessage: string): Correcao[] {
  const fixes: Correcao[] = [];
  const msg = errorMessage.toLowerCase();
  const tabela = extrairTabela(errorMessage);
  const coluna = extrairNomeColuna(errorMessage);
  const constraint = extrairNomeConstraint(errorMessage);

  /* ─── Tabela inexistente ─── */
  if (msg.includes("does not exist") && (msg.includes("relation") || (!msg.includes("column") && !msg.includes("type") && !msg.includes("function") && !msg.includes("schema")))) {
    fixes.push({
      tipo: "erro", tabela,
      titulo: "Tabela não encontrada no banco de dados",
      descricao: `A tabela '${tabela}' referenciada na operação não existe no banco de dados. Isso ocorre quando uma migration ainda não foi aplicada.`,
      causa: "Migration pendente — o schema do banco está desatualizado em relação ao código.",
      passos: [
        `Abra o Supabase Studio em https://supabase.com/dashboard/project/SEU_PROJETO`,
        `Vá em "SQL Editor" e cole o conteúdo do arquivo de migration correspondente`,
        `Ou use a ferramenta MCP: execute supabase_apply_migration com o nome do arquivo .sql`,
        `Após aplicar, clique em "Refresh" no botão de schema cache no Supabase Studio`,
        `Execute o diagnóstico novamente para confirmar`,
      ],
      onde: "Supabase Studio > SQL Editor ou MCP > supabase_apply_migration",
    });
  }

  /* ─── Coluna inexistente ─── */
  if (msg.includes("column") && msg.includes("does not exist")) {
    fixes.push({
      tipo: "erro", tabela,
      titulo: `Coluna '${coluna ?? "desconhecida"}' não encontrada na tabela`,
      descricao: `A coluna '${coluna ?? "desconhecida"}' não existe na tabela '${tabela}'. O código espera uma coluna que o banco não possui.`,
      causa: "A migration que adiciona esta coluna não foi aplicada, ou o nome da coluna no código está errado.",
      passos: [
        `Verifique o schema atual da tabela: MCP > supabase_describe_table("${tabela.split("/")[0] ?? tabela}")`,
        `Compare com o que o código espera — confira o arquivo de migration em supabase/migrations/`,
        `Se a coluna existe na migration mas não no banco: aplique a migration pendente`,
        `Se a migration não existe: crie uma nova migration ALTER TABLE ADD COLUMN`,
        `Após corrigir, rode o diagnóstico novamente`,
      ],
      onde: `MCP > supabase_describe_table ou Supabase Studio > Table Editor > ${tabela}`,
    });
  }

  /* ─── FK violation ─── */
  if (msg.includes("violates foreign key") || msg.includes("foreign key constraint")) {
    fixes.push({
      tipo: "erro", tabela,
      titulo: `Violação de chave estrangeira${constraint ? ` (${constraint})` : ""}`,
      descricao: "A operação tentou criar/atualizar um registro que referencia um ID pai inexistente.",
      causa: constraint
        ? `A constraint '${constraint}' exige que o registro pai exista antes de criar o filho.`
        : "O ID de referência fornecido não corresponde a nenhum registro na tabela pai.",
      passos: [
        `Identifique qual tabela pai é esperada — veja a constraint no erro: ${constraint ? `'${constraint}'` : "verificar mensagem completa"}`,
        `Execute a operação "Criar" primeiro para gerar o registro pai`,
        `Ou verifique se o ID que está sendo usado como referência é válido`,
        `Se for um diagnóstico: execute as operações na ordem correta (Create pai → Create filho)`,
        `Se for dado real: confira se o registro pai não foi excluído acidentalmente`,
      ],
      onde: "Ordem das operações no diagnóstico ou integridade referencial dos dados",
    });
  }

  /* ─── Unique violation ─── */
  if (msg.includes("violates unique constraint") || msg.includes("duplicate key")) {
    fixes.push({
      tipo: "aviso", tabela,
      titulo: `Registro duplicado${constraint ? ` (${constraint})` : ""}`,
      descricao: "Já existe um registro com os mesmos valores em um campo que deve ser único.",
      causa: constraint
        ? `A constraint única '${constraint}' foi violada — os dados de teste colidem com um registro existente.`
        : "Os dados fornecidos já existem no banco.",
      passos: [
        `Use a operação "Excluir" para remover o registro existente antes de criar novamente`,
        `Ou altere os dados de teste no plano de diagnóstico para usar valores diferentes`,
        `Se for um campo como slug/email: gere um valor único (ex: adicione timestamp)`,
        `Para diagnóstico: o cleanup deve ter falhado na execução anterior — execute o cleanup manualmente`,
      ],
      onde: "Dados de teste no plano de diagnóstico ou registros órfãos no banco",
    });
  }

  /* ─── RLS / Permission ─── */
  if (msg.includes("violates row-level security") || msg.includes("new row violates") || msg.includes("permission denied")) {
    fixes.push({
      tipo: "config", tabela,
      titulo: "Política RLS bloqueando a operação",
      descricao: "A Row Level Security do Supabase está impedindo a operação. O usuário não tem permissão para esta ação na tabela.",
      causa: "A RLS policy da tabela não permite a operação para o perfil do usuário atual, ou o empresa_id não está sendo enviado corretamente.",
      passos: [
        `1) No Supabase Studio, vá em Authentication > Policies`,
        `2) Localize a tabela '${tabela}' e revise as policies existentes`,
        `3) Verifique se a policy cobre a operação (INSERT/UPDATE/DELETE) que está falhando`,
        `4) Confirme que o usuário logado tem a role/permissão necessária`,
        `5) Se for multi-tenant: verifique se empresa_id está sendo enviado no payload`,
        `6) Teste temporariamente desativando RLS (não recomendado em produção)`,
        `7) Após ajustar a policy, execute o diagnóstico novamente`,
      ],
      onde: `Supabase Studio > Authentication > Policies > ${tabela}`,
    });
  }

  /* ─── Campo obrigatório ─── */
  if (msg.includes("null value") && msg.includes("not-null")) {
    fixes.push({
      tipo: "erro", tabela,
      titulo: `Campo obrigatório não preenchido${coluna ? ` (${coluna})` : ""}`,
      descricao: `A coluna '${coluna ?? "desconhecida"}' é NOT NULL mas nenhum valor foi fornecido.`,
      causa: `O plano de diagnóstico não está enviando um valor para a coluna '${coluna}', ou a coluna foi adicionada ao banco sem valor padrão.`,
      passos: [
        `Abra o arquivo diagnostic.ts do módulo e localize a operação que está falhando`,
        `Verifique se todos os campos NOT NULL da tabela estão sendo preenchidos`,
        `Use MCP > supabase_describe_table("${tabela}") para listar as colunas obrigatórias`,
        `Adicione o campo faltante nos dados de teste (dadosTeste)`,
        `Se a coluna é nova: altere a migration para definir um DEFAULT value`,
      ],
      onde: `Arquivo diagnostic.ts ou MCP > supabase_describe_table`,
    });
    /* ─── Not null em cadastros (mensagem diferente) ─── */
  } else if ((msg.includes("new row") && msg.includes("violates")) || msg.includes("not null")) {
    fixes.push({
      tipo: "erro", tabela,
      titulo: `Restrição NOT NULL violada`,
      descricao: "Um campo obrigatório não foi preenchido ou recebeu valor nulo.",
      causa: "O plano de diagnóstico ou os dados de teste não incluem todos os campos obrigatórios da tabela.",
      passos: [
        `Identifique qual campo está faltando — veja a mensagem de erro completa no log`,
        `Abra o diagnostic.ts e verifique o insert/update que está falhando`,
        `Adicione o campo obrigatório faltante nos dados de teste`,
        `Se necessário, use MCP > supabase_describe_table para ver o schema completo`,
      ],
      onde: "Arquivo diagnostic.ts do módulo",
    });
  }

  /* ─── Tipo enum inexistente ─── */
  if (msg.includes("type") && msg.includes("does not exist")) {
    fixes.push({
      tipo: "erro",
      titulo: "Tipo enum ou custom type não encontrado",
      descricao: "O tipo personalizado (enum) usado na tabela não foi criado no banco.",
      causa: "Migration do tipo não foi aplicada, ou o tipo foi criado em outro schema.",
      passos: [
        `Localize a migration que define o tipo (CREATE TYPE ... AS ENUM)`,
        `Execute a migration no Supabase Studio (SQL Editor)`,
        `Verifique se o tipo foi criado no schema correto (public)`,
        `Após criar o tipo, a tabela que o utiliza funcionará normalmente`,
      ],
      onde: "Supabase Studio > SQL Editor",
    });
  }

  /* ─── Função inexistente ─── */
  if (msg.includes("function") && msg.includes("does not exist")) {
    fixes.push({
      tipo: "erro",
      titulo: "Função/Stored Procedure não encontrada",
      descricao: "O código tenta chamar uma função do banco que não existe.",
      causa: "Migration da função pendente, ou a função foi criada em outro schema.",
      passos: [
        `Localize a migration que define a função (CREATE OR REPLACE FUNCTION)`,
        `Execute a migration no Supabase Studio (SQL Editor)`,
        `Verifique o nome e schema da função — pode ser necessário schema qualifier`,
        `Teste a função manualmente no SQL Editor para confirmar`,
      ],
      onde: "Supabase Studio > SQL Editor",
    });
  }

  /* ─── Erro de rede ─── */
  if (msg.includes("networkerror") || msg.includes("failed to fetch") || msg.includes("network error")) {
    fixes.push({
      tipo: "erro",
      titulo: "Erro de conexão com o Supabase",
      descricao: "O frontend não conseguiu se comunicar com o servidor Supabase.",
      causa: "Problema de rede, URL do Supabase incorreta, ou servidor offline.",
      passos: [
        `Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas no .env`,
        `Teste a conectividade: abra o URL do Supabase no navegador`,
        `Verifique se o firewall ou proxy não está bloqueando a conexão`,
        `Veja o status do Supabase em https://status.supabase.com`,
        `Se estiver usando local: confirme se o supabase local está rodando (supabase start)`,
      ],
      onde: "Arquivo .env ou terminal",
    });
  }

  /* ─── Auth ─── */
  if (msg.includes("jwt") || msg.includes("unauthorized") || msg.includes("not authenticated")) {
    fixes.push({
      tipo: "config",
      titulo: "Usuário não autenticado ou token inválido",
      descricao: "A sessão do usuário expirou ou o token JWT é inválido.",
      causa: "Token expirado, sessão perdida, ou usuário não está logado.",
      passos: [
        `Faça logout e login novamente no sistema`,
        `Verifique se a sessão do Supabase ainda é válida (localStorage: sb-*-auth-token)`,
        `Se o token expirou: o refresh token automático deve renovar — verifique console`,
        `Se o erro persistir: limpe o cache do navegador e faça login novamente`,
      ],
      onde: "Navegador > Ferramentas do Desenvolvedor > Application > Local Storage",
    });
  }

  /* ─── Timeout ─── */
  if (msg.includes("timeout") || msg.includes("time out")) {
    fixes.push({
      tipo: "aviso",
      titulo: "Timeout na operação do banco",
      descricao: "A consulta ao banco demorou mais que o limite configurado.",
      causa: "Consulta lenta — falta de índices, volume grande de dados, ou conexão lenta.",
      passos: [
        `Verifique se a tabela tem índices nas colunas usadas em WHERE/JOIN`,
        `Use o MCP > supabase_describe_table para ver índices existentes`,
        `Se necessário, crie índices: CREATE INDEX CONCURRENTLY IF NOT EXISTS ...`,
        `Reduza o LIMIT da consulta ou adicione filtros mais específicos`,
        `Se for temporário: execute novamente — pode ser pico de uso`,
      ],
      onde: "Supabase Studio > Database > Indexes ou MCP > supabase_execute_sql",
    });
  }

  /* ─── Schema inexistente ─── */
  if ((msg.includes("schema") && msg.includes("not found")) || (msg.includes("schema") && msg.includes("does not exist"))) {
    fixes.push({
      tipo: "erro",
      titulo: "Schema não encontrado",
      descricao: "O schema utilizado na operação não existe no banco.",
      causa: "Schema não criado, ou nome do schema errado na consulta.",
      passos: [
        `Verifique os schemas existentes no Supabase Studio > Database > Schemas`,
        `Se for um schema personalizado: crie-o com CREATE SCHEMA IF NOT EXISTS ...`,
        `Verifique se o schema está correto na cadeia de conexão ou na query`,
      ],
      onde: "Supabase Studio > Database > Schemas",
    });
  }

  /* ─── Fallback ─── */
  if (fixes.length === 0) {
    fixes.push({
      tipo: "aviso",
      titulo: "Erro não categorizado pelo sistema de correções",
      descricao: "O erro não corresponde a nenhum padrão conhecido. Será necessário debug manual.",
      causa: "Verifique a mensagem de erro completa no log para identificar a causa raiz.",
      passos: [
        `Leia a mensagem de erro completa no LogTerminal (clique em "detalhes")`,
        `Copie o erro e pesquise na documentação do Supabase ou PostgreSQL`,
        `Verifique se o erro é na migration (tabela/coluna faltando) ou na lógica (dados inválidos)`,
        `Se o erro for de SQL: execute a query manualmente no SQL Editor do Supabase`,
        `Se o erro for de lógica: revise o diagnostic.ts do módulo`,
      ],
      onde: "Log de erro + Supabase Studio > SQL Editor para debug manual",
    });
  }

  return fixes;
}
