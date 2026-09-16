export function createSuperAdminProfile(
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "sa-user-123",
    nome: "Super Admin Teste",
    email: "super@admin.com",
    role: "super_admin",
    ambiente: "cadastro",
    is_super_admin: true,
    empresa_id: "empresa-teste-123",
    ...overrides,
  };
}

export function createRegularProfile(
  role: "cadastro" | "consultor" | "tecnologia" | "suporte" = "cadastro",
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "regular-user-456",
    nome: "Usuário Comum",
    email: `${role}@teste.com`,
    role,
    ambiente: role,
    is_super_admin: false,
    empresa_id: "empresa-teste-123",
    ...overrides,
  };
}

export function createAllTruePermissions() {
  return {
    ver_todos_cadastros: true,
    aprovar_cadastro: true,
    reprovar_cadastro: true,
    solicitar_correcao_cadastro: true,
    aprovar_documento: true,
    reprovar_documento: true,
    solicitar_correcao_documento: true,
    aprovar_campo: true,
    reprovar_campo: true,
    solicitar_correcao_campo: true,
    visualizar_documento: true,
    excluir_cadastro: true,
    gerenciar_credenciais: true,
    gerenciar_credenciais_admin: true,
    gerenciar_config: true,
    gerar_links: true,
    ver_relatorios: true,
  };
}
