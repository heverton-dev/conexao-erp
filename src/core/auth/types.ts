import { type User } from "@supabase/supabase-js";

export type EmpresaInfo = {
  id: string;
  nome: string;
  slug: string;
  logo_url?: string;
  logo_index_url?: string;
  logo_app_url?: string;
  favicon_url?: string;
  theme: Record<string, string>;
};

export type Profile = {
  id: string;
  email: string;
  nome: string;
  role: "admin" | "editor" | "viewer";
  avatar_url?: string;
  ambiente: string;
  departamento?: string;
  ativo: boolean;
  is_super_admin: boolean;
};

export type ModuloAcessoItem = {
  acessar: boolean;
  paginas: string[];
  acoes: string[];
};

export type ModulosAcesso = Record<string, ModuloAcessoItem>;

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  permissoes: Record<string, boolean> | null;
  modulosAcesso: ModulosAcesso | null;
  empresa: EmpresaInfo | null;
  modulosAtivos: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  fetchProfile?: (userId: string) => Promise<void>;
  refreshPermissoes?: () => void;
};
