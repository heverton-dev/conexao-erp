export type CalendarioEventoTipo = "post_blog" | "email" | "landing_page" | "post_rede" | "criativo" | "post" | "reuniao" | "deadline" | "evento" | "lancamento";
export type CalendarioEventoStatus = "rascunho" | "agendado" | "publicado" | "cancelado" | "pendente" | "em_andamento" | "concluido";

export type CalendarioEvento = {
  id: string;
  empresa_id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  hora: string | null;
  tipo: CalendarioEventoTipo;
  plataforma: string | null;
  status: CalendarioEventoStatus;
  responsavel: string | null;
  created_at: string;
  updated_at: string;
};
