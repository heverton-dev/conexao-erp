export type LandingPage = {
  id: string;
  empresa_id: string;
  titulo: string;
  slug: string;
  status: "rascunho" | "publicado" | "arquivado";
  conteudo: Record<string, unknown>;
  versao_atual: number;
  template: string | null;
  created_at: string;
  updated_at: string;
  publicado_em: string | null;
};

export type LandingPageVersao = {
  id: string;
  landing_page_id: string;
  versao: number;
  conteudo: Record<string, unknown>;
  created_at: string;
  criado_por: string | null;
};
