export type LogLevel = 'info' | 'success' | 'error' | 'warning' | 'sql' | 'event';

export type Correcao = {
  tabela?: string;
  tipo: "erro" | "aviso" | "config";
  /** Título curto do problema */
  titulo: string;
  /** Explicação do que aconteceu */
  descricao: string;
  /** Causa raiz do erro */
  causa: string;
  /** Passo a passo numerado para corrigir */
  passos: string[];
  /** Onde executar a correção */
  onde?: string;
};

export type LogEntry = {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: string;
  duration?: number;
  correcoes?: Correcao[];
};

export type DiagnosticContext = {
  salvarId: (key: string, id: string) => void;
  recuperarId: (key: string) => string | undefined;
  empresaId: string;
  usuarioId: string;
  dadosTeste: () => Record<string, any>;
  log: (level: LogLevel, message: string, details?: string) => void;
};

export type DiagnosticStep = {
  key: string;
  label: string;
  descricao?: string;
  steps: (ctx: DiagnosticContext) => Promise<void>;
  cleanup?: (ctx: DiagnosticContext) => Promise<void>;
};

export type DiagnosticCrud = {
  create?: (ctx: DiagnosticContext) => Promise<void>;
  read?: (ctx: DiagnosticContext) => Promise<void>;
  update?: (ctx: DiagnosticContext) => Promise<void>;
  delete?: (ctx: DiagnosticContext) => Promise<void>;
};

export type CrudOp = keyof DiagnosticCrud;

export type DiagnosticPlan = {
  key: string;
  nome: string;
  dadosTeste: () => Record<string, any>;
  crud: DiagnosticCrud;
  acoes: DiagnosticStep[];
};

export type DiagnosticResult = {
  success: boolean;
  logs: LogEntry[];
  totalDuration: number;
  passedSteps: number;
  failedSteps: number;
  idsCriados: Record<string, string | undefined>;
};

export const CRUD_LABELS: Record<CrudOp, string> = {
  create: "Criar",
  read: "Ler",
  update: "Atualizar",
  delete: "Excluir",
};

export const CRUD_NAMES: Record<CrudOp, string> = {
  create: "CREATE",
  read: "READ",
  update: "UPDATE",
  delete: "DELETE",
};
