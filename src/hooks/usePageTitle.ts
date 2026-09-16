import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { getAllModules } from "~/registry";

const DEFAULT_TITLE = "ERP Odonto";

export function usePageTitle() {
  const location = useLocation();
  const { empresa } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    // O módulo de catálogo gerencia seu próprio título dinamicamente a partir do banco
    if (path.startsWith("/catalogo")) return;

    const modules = getAllModules();

    let moduleName = "";

    for (const mod of modules) {
      if (mod.routes?.some((r) => path === r || path.startsWith(r + "/"))) {
        moduleName = mod.nome;
        break;
      }
    }

    const companyPrefix = empresa?.nome || DEFAULT_TITLE;
    document.title = moduleName ? `${companyPrefix} | ${moduleName}` : companyPrefix;
  }, [location.pathname, empresa?.nome]);
}
