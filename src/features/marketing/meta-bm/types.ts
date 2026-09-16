export type MetaContaStatus = "conectado" | "expirado" | "desconectado";

export type MetaConta = {
  id: string;
  empresa_id: string;
  meta_user_id: string;
  meta_page_id?: string;
  meta_ad_account_id?: string;
  access_token: string;
  token_expires_at: string;
  status: MetaContaStatus;
  created_at: string;
  updated_at: string;
};

export type MetaCampanhaStatus =
  "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED" | "IN_MODERATION";

export type MetaCampanha = {
  id: string;
  empresa_id: string;
  meta_campanha_id: string;
  nome: string;
  status: MetaCampanhaStatus;
  orcamento_diario?: number;
  orcamento_total?: number;
  plataforma: "facebook" | "instagram" | "both";
  data_inicio: string;
  data_fim?: string;
  created_at: string;
  updated_at: string;
};

export type MetaPost = {
  id: string;
  empresa_id: string;
  meta_post_id?: string;
  conteudo: string;
  midia_url?: string;
  plataforma: "facebook" | "instagram" | "both";
  status: "rascunho" | "agendado" | "publicado" | "erro";
  agendado_para?: string;
  publicado_em?: string;
  created_at: string;
  updated_at: string;
};

export type MetaCampanhaInsight = {
  campanha_id: string;
  impressoes: number;
  cliques: number;
  ctr: number;
  gasto: number;
  conversoes: number;
  cpc: number;
  data: string;
};
