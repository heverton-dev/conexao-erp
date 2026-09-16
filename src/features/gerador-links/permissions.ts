import type { TipoLink } from "./types";

export const GERADOR_LINKS_PERMISSIONS: {
  key: string;
  label: string;
  description: string;
  group: string;
}[] = [
  { key: "lk_ver", label: "Ver módulo", description: "Visualizar o módulo de links", group: "Links" },
  { key: "lk_gerar", label: "Gerar links", description: "Gerar qualquer tipo de link", group: "Links" },
  { key: "lk_salvar", label: "Salvar links", description: "Salvar links no histórico", group: "Links" },
  { key: "lk_editar", label: "Editar links", description: "Editar links salvos no histórico", group: "Links" },
  { key: "lk_excluir", label: "Excluir links", description: "Excluir links do histórico", group: "Links" },
  { key: "lk_gerenciar_templates", label: "Gerenciar templates", description: "CRUD de templates de mensagem/UTM", group: "Links" },
];

export const TIPO_LINK_LABEL: Record<TipoLink, string> = {
  whatsapp: "WhatsApp",
  utm: "UTM",
  google_review: "Google Review",
  google_maps: "Google Maps",
  waze: "Waze",
  qrcode: "QR Code",
};
