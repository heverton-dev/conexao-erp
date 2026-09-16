import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarManutencoes,
  listarManutencoesAtivas,
  salvarManutencao,
  desativarManutencao,
} from "./services/manutencao.service";
import type { ManutencaoInput } from "./types";

export function useManutencoes() {
  return useQuery({
    queryKey: ["manutencoes"],
    queryFn: () => listarManutencoes(),
  });
}

export function useManutencoesAtivas() {
  return useQuery({
    queryKey: ["manutencoes-ativas"],
    queryFn: () => listarManutencoesAtivas(),
  });
}

export function useSalvarManutencao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ManutencaoInput) => salvarManutencao(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manutencoes"] });
      queryClient.invalidateQueries({ queryKey: ["manutencoes-ativas"] });
    },
  });
}

export function useDesativarManutencao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => desativarManutencao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manutencoes"] });
      queryClient.invalidateQueries({ queryKey: ["manutencoes-ativas"] });
    },
  });
}
