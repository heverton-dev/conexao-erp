/**
 * shared/empresas — Tipos de infraestrutura da plataforma.
 */
export type Empresa = {
  id: string;
  nome: string;
  slug: string;
  cnpj?: string;
  razao_social?: string;
  nome_app?: string;
  email?: string;
  celular?: string;
  telefone?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  site?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type EmpresaDesign = {
  empresa_id: string;
  logo_url?: string;
  logo_index_url?: string;
  logo_app_url?: string;
  favicon_url?: string;
  theme: Record<string, string>;
  db_config?: Record<string, string>;
  updated_at: string;
};

/** @deprecated Use EmpresaDesign */
export type EmpresaConfig = EmpresaDesign;

export type ModuloEmpresa = {
  id: string;
  empresa_id: string;
  modulo_key: string;
  ativo: boolean;
  config: Record<string, unknown>;
  created_at: string;
};
