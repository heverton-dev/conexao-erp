import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as emailService from "../services/email-marketing.service";

const QUERY_KEY = "mktg-email";

export function useCampanhas(empresaId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, empresaId],
    queryFn: () => emailService.listarCampanhas(empresaId),
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCriarCampanha(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof emailService.criarCampanha>[0]) =>
      emailService.criarCampanha(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
    },
  });
}

export function useExcluirCampanha(empresaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailService.deletarCampanha(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, empresaId] });
    },
  });
}
