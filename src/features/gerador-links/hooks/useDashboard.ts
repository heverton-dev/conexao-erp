import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/tracking.service";

export function useDashboardStats(dataInicio?: string, dataFim?: string) {
  return useQuery({
    queryKey: ["gerador-links-dashboard", dataInicio, dataFim],
    queryFn: () => getDashboardStats(dataInicio, dataFim),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
