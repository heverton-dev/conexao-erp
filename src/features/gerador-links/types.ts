export type TipoLink = "whatsapp" | "utm" | "google_review" | "google_maps" | "waze" | "qrcode";

export type TipoTemplate = "whatsapp_msg" | "utm_preset";

export type LinkSalvo = {
  id: string;
  empresa_id: string;
  tipo: TipoLink;
  titulo: string;
  url_gerada: string;
  params: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type TemplateMensagem = {
  id: string;
  empresa_id: string;
  tipo: TipoTemplate;
  nome: string;
  conteudo: Record<string, string>;
  created_at: string;
};

export type UtmParams = {
  url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
};

export type WhatsappParams = {
  telefone: string;
  mensagem?: string;
};

export type GoogleReviewParams = {
  placeId: string;
};

export type GoogleMapsParams = {
  lat: string;
  lng: string;
  nome?: string;
};

export type WazeParams = {
  lat: string;
  lng: string;
};

export type LinkClique = {
  id: string;
  link_id: string;
  clique_em: string;
  user_agent: string | null;
  ip: string | null;
  ref: string | null;
};

export type DashboardStats = {
  total_links: number;
  total_cliques: number;
  media_cliques: number;
  cliques_hoje: number;
  cliques_7dias: number;
  links_por_tipo: { tipo: TipoLink; total: number }[];
  cliques_por_dia: { dia: string; total: number }[];
};

export type TopLink = LinkSalvo & { total_cliques: number };
