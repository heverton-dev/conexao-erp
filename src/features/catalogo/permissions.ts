// Permissões internas do módulo (admin/colaborador ERP)
export const CATALOGO_PERMISSIONS = [
  { key: "catalogo_ver_catalogo" as const, label: "Ver catálogo", description: "Visualizar produtos do catálogo na loja", group: "Catálogo" },
  { key: "catalogo_gerenciar_produtos" as const, label: "Gerenciar produtos", description: "CRUD de implantes, componentes e kits", group: "Catálogo" },
  { key: "catalogo_gerenciar_cadastros" as const, label: "Gerenciar cadastros", description: "Gerenciar tabelas auxiliares (famílias, linhas, tipos)", group: "Catálogo" },
  { key: "catalogo_gerenciar_cupons" as const, label: "Gerenciar cupons", description: "Criar e editar cupons de desconto", group: "Catálogo" },
  { key: "catalogo_gerenciar_frete" as const, label: "Gerenciar frete", description: "Configurar regras e faixas de frete", group: "Catálogo" },
  { key: "catalogo_gerenciar_promocionais" as const, label: "Gerenciar promoções", description: "Gerenciar pacotes promocionais", group: "Catálogo" },
  { key: "catalogo_dashboard" as const, label: "Dashboard catálogo", description: "Visualizar KPIs do catálogo", group: "Catálogo" },
  { key: "catalogo_gerenciar_design" as const, label: "Gerenciar design", description: "Personalizar aparência da loja do catálogo", group: "Catálogo" },
  // Novas permissões — Admin
  { key: "catalogo_gerenciar_clientes" as const, label: "Gerenciar clientes", description: "Criar/editar credenciais de acesso ao catálogo", group: "Catálogo" },
  { key: "catalogo_gerenciar_grupos" as const, label: "Gerenciar grupos", description: "Gerenciar grupos de clientes e preços", group: "Catálogo" },
  { key: "catalogo_gerenciar_orcamentos" as const, label: "Gerenciar orçamentos", description: "Visualizar e gerenciar todos os orçamentos", group: "Catálogo" },
  { key: "catalogo_gerenciar_pedidos" as const, label: "Gerenciar pedidos", description: "Visualizar e gerenciar todos os pedidos", group: "Catálogo" },
  { key: "catalogo_gerenciar_solicitacoes" as const, label: "Gerenciar solicitações", description: "Aprovar/rejeitar solicitações de acesso", group: "Catálogo" },
] as const

// Permissões de CLIENTES do catálogo (acesso externo à loja)
export const CATALOGO_CLIENTE_PERMISSIONS = [
  { key: "catalogo_cliente_ver_produtos" as const, label: "Ver produtos", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_ver_precos" as const, label: "Ver preços", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_comprar" as const, label: "Comprar", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_ver_pedidos" as const, label: "Ver pedidos", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_ver_favoritos" as const, label: "Favoritos", group: "Catálogo Cliente" },
  { key: "catalogo_cliente_rastrear" as const, label: "Rastrear entrega", group: "Catálogo Cliente" },
] as const

// Permissões de COLABORADORES (ERP logado — acesso interno ao catálogo)
export const CATALOGO_COLABORADOR_PERMISSIONS = [
  { key: "catalogo_colab_ver_produtos" as const, label: "Consultar produtos", group: "Catálogo Colaborador" },
  { key: "catalogo_colab_ver_precos" as const, label: "Ver preços base", group: "Catálogo Colaborador" },
  { key: "catalogo_colab_criar_orcamento" as const, label: "Criar orçamentos", group: "Catálogo Colaborador" },
  { key: "catalogo_colab_gerenciar_orcamentos" as const, label: "Gerenciar orçamentos", group: "Catálogo Colaborador" },
  { key: "catalogo_colab_compartilhar" as const, label: "Compartilhar orçamentos", group: "Catálogo Colaborador" },
  { key: "catalogo_colab_converter_pedido" as const, label: "Converter orçamento em pedido", group: "Catálogo Colaborador" },
  { key: "catalogo_colab_ver_pedidos" as const, label: "Ver pedidos da carteira", group: "Catálogo Colaborador" },
] as const
