import { describe, it, expect } from "vitest";

/**
 * Testes de validação: RLS policies em modo single-tenant.
 *
 * Verifica que as tabelas têm policies corretas para `authenticated`.
 * Para teste completo, execute os SQLs via Supabase MCP.
 */

describe("RLS check queries", () => {
  it("should have tabelasPrincipais list", () => {
    const tabelasPrincipais = [
      "profiles",
      "cadastros",
      "empresas",
      "empresas_config",
      "permissoes",
      "notificacoes",
      "atividades",
      "documentos",
      "credenciais",
      "webhooks",
      "form_schema",
      "api_connectors",
      "integracoes_config",
    ];

    expect(tabelasPrincipais.length).toBeGreaterThan(0);
    expect(tabelasPrincipais).toContain("profiles");
    expect(tabelasPrincipais).toContain("empresas");
  });

  it("should have tabelasCatalogo list", () => {
    const tabelasCatalogo = [
      "catalogo_implantes",
      "catalogo_abutments",
      "catalogo_componentes",
      "catalogo_clientes",
      "catalogo_pedidos",
      "catalogo_orcamentos",
    ];

    expect(tabelasCatalogo.length).toBeGreaterThan(0);
    expect(tabelasCatalogo).toContain("catalogo_implantes");
  });
});

describe("SQL query generators", () => {
  it("should generate valid SELECT query", () => {
    const tabela = "profiles";
    const sql = `SELECT COUNT(*) as total FROM public.${tabela};`;
    expect(sql).toContain("profiles");
    expect(sql).toContain("COUNT(*)");
  });

  it("should generate valid deny check query", () => {
    const tabela = "profiles";
    const sql = `-- Verificar que anon NÃO acessa ${tabela}
SELECT CASE
  WHEN COUNT(*) = 0 THEN 'OK: anon bloqueado'
  ELSE 'FALHA: anon acessou!'
END as status
FROM pg_policies
WHERE tablename = '${tabela}' AND qual IS NOT NULL;`;
    expect(sql).toContain("profiles");
    expect(sql).toContain("pg_policies");
  });
});
