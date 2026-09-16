import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarAnexos,
  criarAnexo,
  atualizarAnexo,
  deletarAnexo,
} from "../services";
import type { AttachmentInput } from "../types";

export function useAnexos(tarefaId: string | null) {
  return useQuery({
    queryKey: ["funis", "anexos", tarefaId],
    queryFn: () => listarAnexos(tarefaId!),
    enabled: !!tarefaId,
    staleTime: 10_000,
  });
}

export function useCriarAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AttachmentInput) => criarAnexo(input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["funis", "anexos", vars.tarefa_id] });
      qc.invalidateQueries({ queryKey: ["funis", "atividades"] });
    },
  });
}

export function useAtualizarAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<AttachmentInput>;
    }) => atualizarAnexo(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funis", "anexos"] }),
  });
}

export function useDeletarAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletarAnexo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funis", "anexos"] }),
  });
}
