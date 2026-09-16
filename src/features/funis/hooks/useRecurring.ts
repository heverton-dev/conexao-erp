import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarRecorrenciasTarefa,
  criarRecorrencia,
  deletarRecorrencia,
  toggleRecorrencia,
} from "../services/recurring";
import type { RecurringInput } from "../types";

export function useRecorrenciasTarefa(tarefaId: string) {
  return useQuery({
    queryKey: ["funis-recorrencias", tarefaId],
    queryFn: () => listarRecorrenciasTarefa(tarefaId),
    enabled: !!tarefaId,
  });
}

export function useCriarRecorrencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecurringInput) => criarRecorrencia(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["funis-recorrencias", variables.tarefa_id],
      });
    },
  });
}

export function useDeletarRecorrencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarRecorrencia(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["funis-recorrencias"] }),
  });
}

export function useToggleRecorrencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      toggleRecorrencia(id, ativo),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["funis-recorrencias"] }),
  });
}
