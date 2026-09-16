import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/core/supabase";
import { EMPRESA_ID } from "~/config/empresa";
import type { Empresa, EmpresaDesign } from "./types";

type EmpresaContextValue = {
  empresa: Empresa | null;
  config: EmpresaDesign | null;
  loading: boolean;
};

const EmpresaContext = createContext<EmpresaContextValue>({
  empresa: null,
  config: null,
  loading: true,
});

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [config, setConfig] = useState<EmpresaDesign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [empresaRes, configRes] = await Promise.all([
          supabase
            .from("empresas")
            .select("*")
            .eq("id", EMPRESA_ID)
            .single(),
          supabase
            .from("empresas_config")
            .select("*")
            .eq("empresa_id", EMPRESA_ID)
            .single(),
        ]);
        if (!cancelled) {
          setEmpresa(empresaRes.data as Empresa | null);
          setConfig(configRes.data as EmpresaDesign | null);
        }
      } catch (err) {
        console.error("Erro ao carregar EmpresaContext:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresa, config, loading }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export { EmpresaContext };
