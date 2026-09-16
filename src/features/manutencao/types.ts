export type Manutencao = {
  id: string;
  modulo_key: string;
  rota: string | null;
  ativo: boolean;
  mensagem: string;
  data_inicio: string;
  data_fim: string | null;
  criado_por: string | null;
  created_at: string;
};

export type ManutencaoInput = {
  modulo_key: string;
  rota: string | null;
  mensagem: string;
  data_fim: string | null;
};
