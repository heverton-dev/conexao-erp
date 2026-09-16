import { useState, useEffect } from "react";
import { useAuth } from "~/lib/auth";
import { listarEmpresas, type Empresa } from "~/shared/empresas";

export function useEmpresaSuperAdmin() {
  const { profile, empresa } = useAuth();
  const isSuperAdmin = profile?.is_super_admin === true;

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>("");

  useEffect(() => {
    if (isSuperAdmin) {
      listarEmpresas().then((emps) => {
        setEmpresas(emps);
        if (emps.length > 0 && !empresaSelecionada) {
          setEmpresaSelecionada(emps[0].id);
        }
      });
    }
  }, [isSuperAdmin]);

  const empresaId = isSuperAdmin
    ? empresaSelecionada
    : (empresa?.id ?? "");

  return {
    empresaId,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
    isSuperAdmin,
  };
}
