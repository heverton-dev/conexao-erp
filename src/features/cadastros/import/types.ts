export interface ClienteCsvRow {
  // Dados pessoais
  nome: string;
  tipo_pessoa?: "PF" | "PJ";
  cpf_cnpj?: string;

  // Contato
  email?: string;
  telefone?: string;
  whatsapp?: string;

  // Clínica
  nome_clinica?: string;

  // Endereço completo
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;

  // CRM / Observações
  consultor?: string;
  status?: "ativo" | "inativo" | "pendente";
  observacoes?: string;
  colaborador?: string;
  codigo_cliente?: string;
}

export interface ClienteValidation {
  rowIndex: number;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ClienteImportResult {
  inserted: number;
  errors: ClienteValidation[];
}

export interface ClienteImportProgress {
  current: number;
  total: number;
  status: "idle" | "parsing" | "validating" | "executing" | "completed" | "failed";
}
