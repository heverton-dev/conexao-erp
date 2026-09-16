import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarComentarios,
  criarComentario,
  atualizarComentario,
  deletarComentario,
} from "../services";

export function useComentarios(tarefaId: string | null) {
  return useQuery({
    queryKey: ["funis", "comentarios", tarefaId],
    queryFn: () => listarComentarios(tarefaId!),
    enabled: !!tarefaId,
    staleTime: 10_000,
  });
}

export function useCriarComentario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tarefaId, texto }: { tarefaId: string; texto: string }) =>
      criarComentario(tarefaId, texto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["funis", "comentarios", vars.tarefaId],
      });
      qc.invalidateQueries({ queryKey: ["funis", "atividades"] });
    },
  });
}

export function useAtualizarComentario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, texto }: { id: string; texto: string }) =>
      atualizarComentario(id, texto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["funis", "comentarios"] }),
  });
}

export function useDeletarComentario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletarComentario,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["funis", "comentarios"] }),
  });
}
