import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarAutomacoes,
  criarAutomacao,
  atualizarAutomacao,
  deletarAutomacao,
  toggleAutomacao,
} from "../services/automations";
import type { AutomationInput } from "../types";

export function useAutomacoes(funilId: string) {
  return useQuery({
    queryKey: ["funis-automacoes", funilId],
    queryFn: () => listarAutomacoes(funilId),
    enabled: !!funilId,
  });
}

export function useCriarAutomacao(empresaId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AutomationInput) => criarAutomacao(input, empresaId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["funis-automacoes", variables.funil_id],
      });
    },
  });
}

export function useAtualizarAutomacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<AutomationInput>;
    }) => atualizarAutomacao(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funis-automacoes"] });
    },
  });
}

export function useDeletarAutomacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarAutomacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funis-automacoes"] });
    },
  });
}

export function useToggleAutomacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      toggleAutomacao(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funis-automacoes"] });
    },
  });
}
