export type SeoIssue = {
  tipo: "erro" | "aviso" | "info";
  mensagem: string;
  tag?: string;
};

export type SeoAuditoriaResultado = {
  url: string;
  titulo: string | null;
  meta_description: string | null;
  h1: string[];
  h2: string[];
  imagens_sem_alt: number;
  links_quebrados: number;
  issues: SeoIssue[];
  score: number;
};
