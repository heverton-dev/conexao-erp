import { createContext, useContext, type ReactNode } from "react";
import { useManutencoesAtivas } from "./hooks";
import type { Manutencao } from "./types";

type ManutencaoContextValue = {
  ativas: Manutencao[];
  modulosEmManutencao: Set<string>;
  rotasEmManutencao: Set<string>;
  isLoading: boolean;
};

const ManutencaoContext = createContext<ManutencaoContextValue>({
  ativas: [],
  modulosEmManutencao: new Set(),
  rotasEmManutencao: new Set(),
  isLoading: false,
});

export function ManutencaoProvider({ children }: { children: ReactNode }) {
  const { data = [], isLoading } = useManutencoesAtivas();

  const modulosEmManutencao = new Set<string>();
  const rotasEmManutencao = new Set<string>();
  for (const m of data) {
    if (m.rota) rotasEmManutencao.add(m.rota);
    else modulosEmManutencao.add(m.modulo_key);
  }

  return (
    <ManutencaoContext.Provider
      value={{
        ativas: data,
        modulosEmManutencao,
        rotasEmManutencao,
        isLoading,
      }}
    >
      {children}
    </ManutencaoContext.Provider>
  );
}

export function useManutencao() {
  return useContext(ManutencaoContext);
}
