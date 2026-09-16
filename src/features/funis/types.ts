export type FunilPrioridade = "low" | "medium" | "high" | "urgent";
export type FunilPermissaoNivel = "view" | "edit";

export type Funil = {
  id: string;
  titulo: string;
  descricao: string | null;
  created_by: string;
  empresa_id: string | null;
  created_at: string;
  updated_at: string;
  colunas?: FunilColuna[];
  tarefas?: FunilTarefa[];
};

export type FunilColuna = {
  id: string;
  funil_id: string;
  titulo: string;
  posicao: number;
  created_at: string;
};

export type FunilTarefa = {
  id: string;
  funil_id: string;
  coluna_id: string;
  titulo: string;
  descricao: string | null;
  posicao: number;
  prioridade: FunilPrioridade;
  atribuido_para: string | null;
  tools: string[];
  data_inicio: string | null;
  data_fim: string | null;
  depende_tarefa_id: string | null;
  parent_task_id: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type FunilPermissao = {
  id: string;
  funil_id: string;
  user_id: string;
  nivel: FunilPermissaoNivel;
  created_at: string;
};

export type FunilInput = {
  titulo: string;
  descricao?: string;
  colunas?: string[];
};

export type FunilTarefaInput = {
  funil_id: string;
  coluna_id: string;
  titulo: string;
  descricao?: string;
  prioridade?: FunilPrioridade;
  atribuido_para?: string | null;
  tools?: string[];
  data_inicio?: string | null;
  data_fim?: string | null;
  depende_tarefa_id?: string | null;
  parent_task_id?: string | null;
};

export type FunilColunaInput = {
  funil_id: string;
  titulo: string;
  posicao?: number;
};

export type TemplateColuna = {
  id: string;
  template_id: string;
  titulo: string;
  posicao: number;
};

export type TemplateTarefa = {
  id: string;
  template_id: string;
  template_col_idx: number;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  posicao: number;
};

export type Template = {
  id: string;
  nome: string;
  descricao: string | null;
  is_public: boolean;
  created_by: string;
  empresa_id: string | null;
  created_at: string;
  colunas?: TemplateColuna[];
  tarefas?: TemplateTarefa[];
};

export type TemplateInput = {
  nome: string;
  descricao?: string;
  is_public?: boolean;
  colunas?: string[];
  tarefas?: {
    col_idx: number;
    titulo: string;
    descricao?: string;
    prioridade?: string;
  }[];
};

export type Comment = {
  id: string;
  tarefa_id: string;
  user_id: string;
  texto: string;
  created_at: string;
  updated_at: string;
  user?: { full_name: string; email: string };
};

export type CommentInput = {
  tarefa_id: string;
  texto: string;
};

export type Label = {
  id: string;
  funil_id: string;
  nome: string;
  cor: string;
  empresa_id: string | null;
  created_at: string;
};

export type LabelInput = {
  funil_id: string;
  nome: string;
  cor?: string;
};

export type Attachment = {
  id: string;
  tarefa_id: string;
  url: string;
  titulo: string;
  tipo: string;
  created_by: string;
  created_at: string;
};

export type AttachmentInput = {
  tarefa_id: string;
  url: string;
  titulo: string;
  tipo?: string;
};

export type Automation = {
  id: string;
  funil_id: string;
  nome: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  ativo: boolean;
  created_by: string;
  empresa_id: string | null;
  created_at: string;
  updated_at?: string;
};

export type AutomationInput = {
  funil_id: string;
  nome: string;
  trigger_type: string;
  trigger_config?: Record<string, unknown>;
  action_type: string;
  action_config?: Record<string, unknown>;
};

export type Notification = {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string | null;
  link: string | null;
  lida: boolean;
  created_at: string;
  empresa_id: string | null;
};

export type Recurring = {
  id: string;
  tarefa_id: string;
  frequencia: string;
  config: Record<string, unknown>;
  proxima_exec: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  tarefa?: FunilTarefa;
};

export type RecurringInput = {
  tarefa_id: string;
  frequencia: string;
  config: Record<string, unknown>;
};

export type Activity = {
  id: string;
  tarefa_id: string | null;
  funil_id: string | null;
  user_id: string;
  acao: string;
  dados_json: Record<string, unknown>;
  created_at: string;
  user?: { full_name: string; email: string };
};

export type FunisFilters = {
  busca: string;
  prioridades: string[];
  responsaveis: string[];
  labels: string[];
  data_inicio_de: string | null;
  data_inicio_ate: string | null;
  data_fim_de: string | null;
  data_fim_ate: string | null;
  status: string | null;
  colunas: string[];
};
