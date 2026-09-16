import { type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { getAllModules } from "~/registry";
import { useManutencao } from "~/features/manutencao/ManutencaoContext";
import { MaintenanceScreen } from "./MaintenanceScreen";
import type { Manutencao } from "~/features/manutencao/types";

function resolveActiveModule(pathname: string): string | undefined {
  const allMods = getAllModules();
  for (const mod of allMods) {
    if (mod.routes?.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return mod.key;
    }
  }
  return undefined;
}

function entryMatches(
  entry: Manutencao,
  pathname: string,
  activeModule: string | undefined,
): boolean {
  if (entry.rota) {
    return pathname === entry.rota || pathname.startsWith(entry.rota + "/");
  }
  return !!activeModule && entry.modulo_key === activeModule;
}

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const isSuper = profile?.is_super_admin === true;

  const { ativas, isLoading } = useManutencao();

  if (pathname === "/global/manutencao" || pathname === "/empresa/manutencao") {
    return <>{children}</>;
  }
  if (isSuper) return <>{children}</>;
  if (isLoading) return <>{children}</>;

  const activeModule = resolveActiveModule(pathname);

  for (const entry of ativas) {

    if (entryMatches(entry, pathname, activeModule)) {
      const escopoLabel = entry.rota
        ? `Rota ${entry.rota}`
        : `Módulo ${entry.modulo_key}`;
      return (
        <MaintenanceScreen
          mensagem={entry.mensagem}
          dataFim={entry.data_fim}
          escopo={escopoLabel}
        />
      );
    }
  }

  return <>{children}</>;
}
