export interface AgenteIA {
  id: string;
  empresa_id: string | null;
  nome: string;
  modulo_key: string;
  route: string | null;
  provedor_url: string;
  provedor_api_key: string;
  modelo: string;
  system_prompt: string | null;
  render_mode: "floating" | "header_icon";
  execution_mode: "ai_provider" | "webhook";
  webhook_url: string | null;
  redes_sociais: Record<string, string>;
  google_drive_folder_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgenteKnowledgeDoc {
  id: string;
  agente_id: string;
  tipo: "documento" | "csv" | "json" | "html" | "pdf";
  nome_arquivo: string;
  conteudo: string;
  tamanho_bytes: number;
  created_at: string;
}

export interface AgenteKnowledgeTabela {
  id: string;
  agente_id: string;
  tabela_nome: string;
  incluida: boolean;
  created_at: string;
}

export interface AgenteConversa {
  id: string;
  agente_id: string;
  usuario_id: string;
  mensagens: ChatMessage[];
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UsageInfo {
  session_id: string;
  action_cost: number;
  session_cost: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatResponse {
  resposta: string;
  usage: UsageInfo | null;
}

export interface AgenteUsageLog {
  id: string;
  empresa_id: string | null;
  agente_id: string | null;
  session_id: string;
  modelo: string;
  provedor: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  created_at: string;
}

export type WizardStep = "api" | "modulo" | "knowledge" | "revisao";

export interface ProvedorIA {
  id: string;
  nome: string;
  url: string;
  api_key_global: string | null;
  modelos: string[];
  cor: string;
  icone: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface CriarProvedorInput {
  nome: string;
  url: string;
  api_key_global?: string;
  modelos: string[];
  cor?: string;
  icone?: string;
  ativo?: boolean;
  ordem?: number;
}

export interface UpdateProvedorInput extends Partial<CriarProvedorInput> {
  id: string;
}

export interface CriarAgenteInput {
  nome: string;
  modulo_key: string;
  route?: string;
  provedor_url: string;
  provedor_api_key: string;
  modelo: string;
  system_prompt?: string;
  render_mode: "floating" | "header_icon";
  execution_mode?: "ai_provider" | "webhook";
  webhook_url?: string;
  redes_sociais?: Record<string, string>;
  google_drive_folder_url?: string;
}

export interface UpdateAgenteInput extends Partial<CriarAgenteInput> {
  id: string;
  ativo?: boolean;
}

export interface ProvedorIA {
  id: string;
  nome: string;
  url: string;
  api_key_global: string | null;
  modelos: string[];
  cor: string;
  icone: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface CriarProvedorInput {
  nome: string;
  url: string;
  api_key_global?: string;
  modelos: string[];
  cor?: string;
  icone?: string;
  ativo?: boolean;
  ordem?: number;
}

export interface UpdateProvedorInput extends Partial<CriarProvedorInput> {
  id: string;
}
