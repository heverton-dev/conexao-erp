export type SurveyQuestionType =
  "nps" | "single_choice" | "multi_choice" | "text" | "matrix";

export type NpsPergunta = {
  id: string;
  empresa_id: string;
  key: string;
  order_index: number;
  type: SurveyQuestionType;
  question_text: string;
  options: string[];
  required: boolean;
  active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export type NpsResposta = {
  id: string;
  empresa_id: string;
  nps_score: number | null;
  nps_comment: string;
  csat: string;
  atendimento_comercial: string;
  entendimento_consultor: string;
  melhoria_atendimento: string;
  experiencia_compra: string;
  matrix_facilidade_pedido: number;
  matrix_clareza_condicoes: number;
  matrix_prazo_entrega: number;
  matrix_disponibilidade_produtos: number;
  matrix_comunicacao: number;
  expansao_produtos: string;
  oportunidade: string;
  pergunta_final: string;
  order_id: string | null;
  client_id: string | null;
  source: string | null;
  client_name: string | null;
  vendor_name: string | null;
  dynamic_answers?: Record<string, any> | null;
  created_at: string;
};

export type NpsWebhookConfig = {
  id: string;
  empresa_id: string;
  url: string;
  active: boolean;
  created_at: string;
};

export type NpsRelatorioEnvio = {
  id: number;
  empresa_id: string;
  data_envio: string;
  total_processado: number;
  enviados_sucesso: number;
  sem_whatsapp: number;
  nps_menor_30: number;
  clientes_detalhes: string | null;
  html_relatorio: string | null;
  created_at: string;
};

export type NpsBucket = "all" | "detractors" | "passives" | "promoters";

export const MATRIX_COLUMN_MAP: Record<string, string> = {
  "Facilidade de pedido": "matrix_facilidade_pedido",
  "Clareza das condições comerciais": "matrix_clareza_condicoes",
  "Prazo de entrega": "matrix_prazo_entrega",
  "Disponibilidade de produtos": "matrix_disponibilidade_produtos",
  "Comunicação durante o processo": "matrix_comunicacao",
};
