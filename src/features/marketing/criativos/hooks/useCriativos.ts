import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as criativosService from "../services/criativos.service";

const QUERY_KEY = "mktg-criativos";

export function useCriativos(empresaId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, empresaId],
    queryFn: () => criativosService.listarCriativos(empresaId),
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCriarCriativo(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof criativosService.criarCriativo>[0]) =>
      criativosService.criarCriativo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
    },
  });
}

export function useExcluirCriativo(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => criativosService.deletarCriativo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
    },
  });
}
