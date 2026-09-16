import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarLabels,
  criarLabel,
  atualizarLabel,
  deletarLabel,
  adicionarLabelTarefa,
  removerLabelTarefa,
  listarLabelsTarefa,
} from "../services";
import type { LabelInput } from "../types";

export function useLabels(funilId: string | null) {
  return useQuery({
    queryKey: ["funis", "labels", funilId],
    queryFn: () => listarLabels(funilId!),
    enabled: !!funilId,
    staleTime: 30_000,
  });
}

export function useLabelsTarefa(tarefaId: string | null) {
  return useQuery({
    queryKey: ["funis", "tarefa-labels", tarefaId],
    queryFn: () => listarLabelsTarefa(tarefaId!),
    enabled: !!tarefaId,
  });
}

export function useCriarLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LabelInput) => criarLabel(input),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["funis", "labels", vars.funil_id] }),
  });
}

export function useAtualizarLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<LabelInput> }) =>
      atualizarLabel(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funis", "labels"] }),
  });
}

export function useDeletarLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletarLabel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funis", "labels"] }),
  });
}

export function useAdicionarLabelTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tarefaId,
      labelId,
    }: {
      tarefaId: string;
      labelId: string;
    }) => adicionarLabelTarefa(tarefaId, labelId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funis"] }),
  });
}

export function useRemoverLabelTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tarefaId,
      labelId,
    }: {
      tarefaId: string;
      labelId: string;
    }) => removerLabelTarefa(tarefaId, labelId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funis"] }),
  });
}
