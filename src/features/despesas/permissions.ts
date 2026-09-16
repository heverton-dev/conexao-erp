export const DESPESAS_PERMISSIONS: {
  key: string;
  label: string;
  description: string;
  group: string;
}[] = [
  {
    key: "despesas_lancar",
    label: "Lançar despesas",
    description: "Permite lançar novas despesas em rota",
    group: "Despesas",
  },
  {
    key: "despesas_enviar",
    label: "Enviar despesas",
    description: "Permite enviar lote de despesas para aprovação",
    group: "Despesas",
  },
  {
    key: "despesas_aprovar",
    label: "Aprovar despesas",
    description: "Permite aprovar envios de despesas",
    group: "Aprovação",
  },
  {
    key: "despesas_reprovar",
    label: "Reprovar despesas",
    description: "Permite reprovar envios de despesas",
    group: "Aprovação",
  },
  {
    key: "despesas_definir_pagamento",
    label: "Definir pagamento",
    description: "Permite definir forma e data de pagamento",
    group: "Pagamento",
  },
  {
    key: "despesas_configurar",
    label: "Configurar despesas",
    description: "Permite configurar tipos e valores de despesas",
    group: "Administração",
  },
  {
    key: "despesas_ver_relatorios",
    label: "Ver relatórios",
    description: "Permite visualizar relatórios de despesas",
    group: "Visualização",
  },
  {
    key: "despesas_ver_todas",
    label: "Ver todas as despesas",
    description: "Permite visualizar despesas de todos os colaboradores",
    group: "Visualização",
  },
];

export type DespesaPermGroup = { label: string; keys: string[] };
