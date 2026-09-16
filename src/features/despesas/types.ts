export type DespesaStatus =
  "rascunho" | "pendente" | "aprovada" | "reprovada" | "paga";
export type EnvioStatus = "pendente" | "aprovado" | "reprovado" | "parcial";
export type PagamentoStatus = "pendente" | "pago" | "cancelado";
export type FormaPagamento = "pix" | "transferencia" | "dinheiro";
export type Frequencia = "semanal" | "quinzenal" | "mensal";
export type PeriodoStatus = "aberto" | "fechado";
export type ComprovanteTipo = "upload" | "link";

export interface DespesaTipo {
  id: string;
  empresa_id: string;
  nome: string;
  valor_maximo: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DespesaConfig {
  id: string;
  empresa_id: string;
  frequencia: Frequencia;
  dia_envio: number;
  dias_aviso: number;
  created_at: string;
  updated_at: string;
}

export interface DespesaPeriodo {
  id: string;
  empresa_id: string;
  data_inicio: string;
  data_fim: string;
  status: PeriodoStatus;
  created_at: string;
  updated_at: string;
}

export interface Despesa {
  id: string;
  empresa_id: string;
  usuario_id: string;
  periodo_id: string;
  tipo_id: string;
  data_despesa: string;
  valor: number;
  descricao: string;
  comprovante_url: string;
  comprovante_tipo: ComprovanteTipo;
  status: DespesaStatus;
  comentario_reprovacao: string;
  created_at: string;
  updated_at: string;
  tipo?: DespesaTipo;
  periodo?: DespesaPeriodo;
  usuario?: { email: string; nome: string };
}

export interface DespesaEnvio {
  id: string;
  empresa_id: string;
  usuario_id: string;
  periodo_id: string;
  total_despesas: number;
  valor_total: number;
  status: EnvioStatus;
  aprovador_id: string | null;
  data_aprovacao: string | null;
  comentario: string;
  created_at: string;
  updated_at: string;
  periodo?: DespesaPeriodo;
  usuario?: { email: string; nome: string };
  aprovador?: { email: string; nome: string };
  despesas?: Despesa[];
}

export interface DespesaPagamento {
  id: string;
  empresa_id: string;
  envio_id: string;
  valor: number;
  forma_pagamento: FormaPagamento;
  data_pagamento: string;
  status: PagamentoStatus;
  comprovante_pagamento: string;
  created_at: string;
  updated_at: string;
  envio?: DespesaEnvio;
}

export interface DespesaFormData {
  tipo_id: string;
  data_despesa: string;
  valor: number;
  descricao: string;
  comprovante_url: string;
  comprovante_tipo: ComprovanteTipo;
  periodo_id?: string;
}

export interface DespesaFiltros {
  periodo_id?: string;
  status?: DespesaStatus;
  tipo_id?: string;
  usuario_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface EnvioFiltros {
  status?: EnvioStatus;
  periodo_id?: string;
  usuario_id?: string;
}

export interface OcrResultado {
  texto: string;
  valor?: number;
  data?: string;
  descricao?: string;
  tipoSugestao?: string;
}

export const DESPESA_STATUS_LABEL: Record<DespesaStatus, string> = {
  rascunho: "Rascunho",
  pendente: "Pendente",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  paga: "Paga",
};

export const DESPESA_STATUS_COLOR: Record<DespesaStatus, string> = {
  rascunho: "bg-gray-500/10 text-gray-400",
  pendente: "bg-yellow-500/10 text-yellow-400",
  aprovada: "bg-green-500/10 text-green-400",
  reprovada: "bg-red-500/10 text-red-400",
  paga: "bg-blue-500/10 text-blue-400",
};

export const ENVIO_STATUS_LABEL: Record<EnvioStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  parcial: "Parcial",
};

export const ENVIO_STATUS_COLOR: Record<EnvioStatus, string> = {
  pendente: "bg-yellow-500/10 text-yellow-400",
  aprovado: "bg-green-500/10 text-green-400",
  reprovado: "bg-red-500/10 text-red-400",
  parcial: "bg-orange-500/10 text-orange-400",
};

export const PAGAMENTO_STATUS_LABEL: Record<PagamentoStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
};

export const PAGAMENTO_STATUS_COLOR: Record<PagamentoStatus, string> = {
  pendente: "bg-yellow-500/10 text-yellow-400",
  pago: "bg-green-500/10 text-green-400",
  cancelado: "bg-gray-500/10 text-gray-400",
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: "PIX",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
};

export const FREQUENCIA_LABEL: Record<Frequencia, string> = {
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
};
