export const ROTAS_PERMISSIONS: {
  key: string;
  label: string;
  description: string;
  group: string;
}[] = [
  {
    key: "rotas_planejar",
    label: "Planejar rotas",
    description: "Criar e editar planejamento de rotas",
    group: "Rotas",
  },
  {
    key: "rotas_executar",
    label: "Executar rotas",
    description: "Iniciar e finalizar rotas e visitas",
    group: "Rotas",
  },
  {
    key: "rotas_configurar",
    label: "Configurar rotas",
    description: "Configurar valor KM e raio permitido",
    group: "Administração",
  },
  {
    key: "rotas_upload_base",
    label: "Upload base clientes",
    description: "Fazer upload da base de clientes via CSV",
    group: "Administração",
  },
  {
    key: "rotas_ver_relatorios",
    label: "Ver relatórios",
    description: "Visualizar relatórios de rotas",
    group: "Visualização",
  },
  {
    key: "rotas_form_config",
    label: "Configurar formulário",
    description: "Configurar perguntas do formulário pós-visita",
    group: "Administração",
  },
];
