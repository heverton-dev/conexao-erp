import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as leadsService from "../services/leads.service";
import type { MktgLead } from "../types";

const QUERY_KEY = "mktg-leads";

export function useLeads(empresaId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, empresaId],
    queryFn: () => leadsService.listarLeads(empresaId),
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLead(id: string, empresaId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => leadsService.buscarLead(id, empresaId),
    enabled: !!id && !!empresaId,
  });
}

export function useCriarLead(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof leadsService.criarLead>[0]) =>
      leadsService.criarLead(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
    },
  });
}

export function useAtualizarLead(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MktgLead> }) =>
      leadsService.atualizarLead(id, updates, empresaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
    },
  });
}

export function useExcluirLead(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.deletarLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
    },
  });
}
