export const LEADS_PERMISSIONS: {
  key: string;
  label: string;
  description: string;
  group: string;
}[] = [
  { key: "mktg_lead_ver", label: "Ver Leads", description: "Visualizar leads", group: "Leads" },
  { key: "mktg_lead_criar", label: "Criar Leads", description: "Criar novos leads", group: "Leads" },
  { key: "mktg_lead_editar", label: "Editar Leads", description: "Editar leads existentes", group: "Leads" },
  { key: "mktg_lead_excluir", label: "Excluir Leads", description: "Remover leads", group: "Leads" },
];
