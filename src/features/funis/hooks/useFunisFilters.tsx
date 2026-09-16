import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { FunisFilters } from "../types";

const defaultFilters: FunisFilters = {
  busca: "",
  prioridades: [],
  responsaveis: [],
  labels: [],
  data_inicio_de: null,
  data_inicio_ate: null,
  data_fim_de: null,
  data_fim_ate: null,
  status: null,
  colunas: [],
};

type FunisFiltersContextType = {
  filters: FunisFilters;
  setFilters: (filters: Partial<FunisFilters>) => void;
  resetFilters: () => void;
  activeFilterCount: number;
};

const FunisFiltersContext = createContext<FunisFiltersContextType | null>(null);

export function FunisFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FunisFilters>(defaultFilters);

  const setFilters = useCallback((partial: Partial<FunisFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const activeFilterCount = [
    filters.busca ? 1 : 0,
    filters.prioridades.length > 0 ? 1 : 0,
    filters.responsaveis.length > 0 ? 1 : 0,
    filters.labels.length > 0 ? 1 : 0,
    filters.data_inicio_de || filters.data_inicio_ate ? 1 : 0,
    filters.data_fim_de || filters.data_fim_ate ? 1 : 0,
    filters.status ? 1 : 0,
    filters.colunas.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <FunisFiltersContext.Provider
      value={{ filters, setFilters, resetFilters, activeFilterCount }}
    >
      {children}
    </FunisFiltersContext.Provider>
  );
}

export function useFunisFilters() {
  const ctx = useContext(FunisFiltersContext);
  if (!ctx)
    throw new Error("useFunisFilters must be used within FunisFiltersProvider");
  return ctx;
}
