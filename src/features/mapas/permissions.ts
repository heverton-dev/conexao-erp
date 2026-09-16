export type MapasPermDef = {
  key: string;
  label: string;
  description: string;
  group: string;
};

export const MAPAS_PERMISSIONS: MapasPermDef[] = [
  {
    key: "mapas_ver_mapa_publico",
    label: "Ver mapa público",
    description: "Visualizar o mapa interativo de presença comercial",
    group: "Mapas",
  },
  {
    key: "mapas_gerir_distribuidores",
    label: "Gerenciar distribuidores",
    description: "Adicionar, editar e remover distribuidores no mapa",
    group: "Mapas",
  },
  {
    key: "mapas_gerir_consultores",
    label: "Gerenciar consultores",
    description: "Adicionar, editar e remover consultores no mapa",
    group: "Mapas",
  },
  {
    key: "mapas_ver_insights",
    label: "Ver insights/dashboard",
    description: "Acessar o painel de métricas e insights do mapa",
    group: "Mapas",
  },
  {
    key: "mapas_gerir_webhooks",
    label: "Gerenciar webhooks",
    description: "Configurar webhooks disparados por eventos do módulo Mapas",
    group: "Mapas",
  },
];
