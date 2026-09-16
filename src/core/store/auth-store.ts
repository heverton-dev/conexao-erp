import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  nome: string;
  role: string;
  ambiente: string;
  is_super_admin: boolean;
  // empresa_id removido — single-tenant
}

interface Empresa {
  id: string;
  nome: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  empresa: Empresa | null;
  modulosAtivos: string[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setEmpresa: (empresa: Empresa | null) => void;
  setModulosAtivos: (modulos: string[]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      empresa: null,
      modulosAtivos: [],
      loading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setEmpresa: (empresa) => set({ empresa }),
      setModulosAtivos: (modulosAtivos) => set({ modulosAtivos }),
      setLoading: (loading) => set({ loading }),
      logout: () =>
        set({ user: null, profile: null, empresa: null, modulosAtivos: [] }),
    }),
    { name: "auth-storage" },
  ),
);
