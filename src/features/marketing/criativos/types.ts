export type Criativo = {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  tipo: "imagem" | "video" | "banner";
  arquivo_url: string | null;
  preview_url: string | null;
  tags: string[];
  status: "ativo" | "rascunho" | "arquivado";
  created_at: string;
  updated_at: string;
};
