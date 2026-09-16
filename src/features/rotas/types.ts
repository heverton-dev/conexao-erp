export type RotaStatus =
  "planejada" | "em_execucao" | "realizada" | "nao_realizada" | "cancelada";
export type RotaTipo = "diaria" | "semanal" | "mensal";
export type RotaClienteStatus =
  "pendente" | "em_trajeto" | "em_visita" | "visitado" | "nao_visitado";
export type FonteCliente = "csv" | "cadastros" | "crm";
export type FormPerguntaTipo =
  | "texto_curto"
  | "texto_longo"
  | "data"
  | "multipla_escolha"
  | "selecao"
  | "radio";

export interface RotasConfig {
  id: string;
  empresa_id: string;
  valor_km_reembolso: number;
  raio_permitido_metros: number;
  google_maps_api_key: string;
  created_at: string;
  updated_at: string;
}

export interface RotaClienteBase {
  id: string;
  empresa_id: string;
  usuario_id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  bairro: string | null;
  rua: string | null;
  numero: string | null;
  cep: string | null;
  endereco_completo: string | null;
  latitude: number | null;
  longitude: number | null;
  ticket_medio: number | null;
  categoria: string | null;
  ultima_visita: string | null;
  fonte: FonteCliente;
  fonte_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rota {
  id: string;
  empresa_id: string;
  usuario_id: string;
  titulo: string;
  data_rota: string;
  tipo: RotaTipo;
  status: RotaStatus;
  data_inicio: string | null;
  data_fim: string | null;
  local_inicio: { lat: number; lng: number } | null;
  local_fim: { lat: number; lng: number } | null;
  total_visitas: number;
  total_km: number;
  total_tempo_trajeto_min: number;
  valor_reembolso: number;
  created_at: string;
  updated_at: string;
  clientes?: RotaCliente[];
}

export interface RotaCliente {
  id: string;
  empresa_id: string;
  rota_id: string;
  cliente_base_id: string;
  ordem: number;
  status: RotaClienteStatus;
  created_at: string;
  updated_at: string;
  cliente?: RotaClienteBase;
  trajeto?: RotaTrajeto;
  visita?: RotaVisita;
}

export interface RotaTrajeto {
  id: string;
  empresa_id: string;
  rota_id: string;
  rota_cliente_id: string;
  origem_lat: number | null;
  origem_lng: number | null;
  destino_lat: number | null;
  destino_lng: number | null;
  distancia_km: number | null;
  duracao_minutos: number | null;
  valor_reembolso: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string;
}

export interface RotaVisita {
  id: string;
  empresa_id: string;
  rota_id: string;
  rota_cliente_id: string;
  cliente_base_id: string;
  consultor_id: string;
  data_inicio: string;
  data_fim: string | null;
  duracao_minutos: number | null;
  local_inicio: { lat: number; lng: number } | null;
  local_fim: { lat: number; lng: number } | null;
  dentro_raio: boolean;
  formulario: Record<string, unknown>;
  created_at: string;
}

export interface RotasFormPergunta {
  id: string;
  empresa_id: string;
  titulo: string;
  tipo: FormPerguntaTipo;
  opcoes: string[];
  obrigatorio: boolean;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RotaFormData {
  titulo: string;
  data_rota: string;
  tipo: RotaTipo;
  cliente_ids: string[];
}

export interface ClienteBaseFilters {
  cidade?: string;
  estado?: string;
  categoria?: string;
  ticket_medio_min?: number;
  ticket_medio_max?: number;
  ultima_visita_antes?: string;
  ultima_visita_apos?: string;
  search?: string;
}

export const ROTA_STATUS_LABEL: Record<RotaStatus, string> = {
  planejada: "Planejada",
  em_execucao: "Em Execução",
  realizada: "Realizada",
  nao_realizada: "Não Realizada",
  cancelada: "Cancelada",
};

export const ROTA_STATUS_COLOR: Record<RotaStatus, string> = {
  planejada: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  em_execucao: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  realizada: "bg-green-500/15 text-green-400 border border-green-500/20",
  nao_realizada: "bg-red-500/15 text-red-400 border border-red-500/20",
  cancelada: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
};

export const ROTA_CLIENTE_STATUS_LABEL: Record<RotaClienteStatus, string> = {
  pendente: "Pendente",
  em_trajeto: "Em Trajeto",
  em_visita: "Em Visita",
  visitado: "Visitado",
  nao_visitado: "Não Visitado",
};

export const ROTA_CLIENTE_STATUS_COLOR: Record<RotaClienteStatus, string> = {
  pendente: "bg-gray-500/10 text-gray-400",
  em_trajeto: "bg-blue-500/10 text-blue-400",
  em_visita: "bg-yellow-500/10 text-yellow-400",
  visitado: "bg-green-500/10 text-green-400",
  nao_visitado: "bg-red-500/10 text-red-400",
};

export const ROTA_TIPO_LABEL: Record<RotaTipo, string> = {
  diaria: "Diária",
  semanal: "Semanal",
  mensal: "Mensal",
};

export const FORM_PERGUNTA_TIPO_LABEL: Record<FormPerguntaTipo, string> = {
  texto_curto: "Texto Curto",
  texto_longo: "Texto Longo",
  data: "Data",
  multipla_escolha: "Múltipla Escolha",
  selecao: "Seleção",
  radio: "Rádio",
};
