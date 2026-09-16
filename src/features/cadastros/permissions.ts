export const ALL_PERMISSIONS: {
  key: string;
  label: string;
  description: string;
  group: string;
}[] = [
  {
    key: "ver_todos_cadastros",
    label:
      "Ver todos os cadastros da empresa (se inativo, vê apenas os que criou)",
    description: "Permite visualizar todos os cadastros do sistema",
    group: "Escopo de Dados",
  },
  {
    key: "ver_relatorios",
    label: "Ver relatórios",
    description: "Permite acessar a página de relatórios",
    group: "Visualização",
  },
  {
    key: "visualizar_documento",
    label: "Visualizar arquivos dos documentos",
    description: "Permite abrir e visualizar arquivos dos documentos",
    group: "Visualização",
  },
  {
    key: "aprovar_cadastro",
    label: "Aprovar cadastro",
    description: "Permite aprovar um cadastro (definir código do cliente)",
    group: "Aprovação de Cadastro",
  },
  {
    key: "reprovar_cadastro",
    label: "Reprovar cadastro",
    description: "Permite reprovar um cadastro",
    group: "Aprovação de Cadastro",
  },
  {
    key: "solicitar_correcao_cadastro",
    label: "Solicitar correção de cadastro",
    description: "Permite solicitar correção de um cadastro",
    group: "Aprovação de Cadastro",
  },
  {
    key: "aprovar_documento",
    label: "Aprovar documento",
    description: "Permite aprovar documentos anexados",
    group: "Aprovação de Documentos",
  },
  {
    key: "reprovar_documento",
    label: "Reprovar documento",
    description: "Permite reprovar documentos",
    group: "Aprovação de Documentos",
  },
  {
    key: "solicitar_correcao_documento",
    label: "Solicitar correção de documento",
    description: "Permite solicitar correção de documentos",
    group: "Aprovação de Documentos",
  },
  {
    key: "aprovar_campo",
    label: "Aprovar campo",
    description: "Permite aprovar campos individuais do formulário",
    group: "Aprovação de Campos",
  },
  {
    key: "reprovar_campo",
    label: "Reprovar campo",
    description: "Permite reprovar campos individuais",
    group: "Aprovação de Campos",
  },
  {
    key: "solicitar_correcao_campo",
    label: "Solicitar correção de campo",
    description: "Permite solicitar correção de campos",
    group: "Aprovação de Campos",
  },
  {
    key: "gerenciar_credenciais",
    label: "Gerenciar credenciais (ver + ativar/inativar)",
    description: "Acessar página de credenciais e ativar/inativar usuários",
    group: "Credenciais",
  },
  {
    key: "gerenciar_credenciais_admin",
    label: "Gerenciar credenciais (criar/editar/deletar)",
    description: "Criar, editar e deletar credenciais de acesso",
    group: "Credenciais",
  },
  {
    key: "excluir_cadastro",
    label: "Excluir cadastro",
    description: "Permite excluir cadastros permanentemente",
    group: "Administração",
  },
  {
    key: "gerenciar_config",
    label: "Gerenciar configurações do sistema",
    description: "Acessar configurações do sistema (variáveis, webhooks)",
    group: "Administração",
  },
  {
    key: "gerar_links",
    label: "Gerar links de cadastro",
    description: "Permite gerar links de cadastro para leads",
    group: "Geração de Links",
  },
];

export type PermGroup = { label: string; keys: string[] };
