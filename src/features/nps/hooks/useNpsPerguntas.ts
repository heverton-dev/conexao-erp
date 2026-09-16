import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarPerguntas,
  criarPergunta,
  atualizarPergunta,
  excluirPergunta,
  toggleAtiva,
} from "../services/perguntas";
import type { NpsPergunta } from "../types";

export function usePerguntas(empresaId: string) {
  return useQuery({
    queryKey: ["nps", "perguntas", empresaId],
    queryFn: () => listarPerguntas(empresaId),
    enabled: !!empresaId,
  });
}

export function useCriarPergunta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      empresaId,
      pergunta,
    }: {
      empresaId: string;
      pergunta: Omit<
        NpsPergunta,
        "id" | "empresa_id" | "created_at" | "updated_at"
      >;
    }) => criarPergunta(empresaId, pergunta),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["nps", "perguntas", variables.empresaId],
      });
    },
  });
}

export function useAtualizarPergunta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      pergunta,
    }: {
      id: string;
      pergunta: Partial<NpsPergunta>;
    }) => atualizarPergunta(id, pergunta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nps", "perguntas"] });
    },
  });
}

export function useExcluirPergunta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, empresaId }: { id: string; empresaId: string }) =>
      excluirPergunta(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["nps", "perguntas", variables.empresaId],
      });
    },
  });
}

export function useTogglePerguntaAtiva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleAtiva(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nps", "perguntas"] });
    },
  });
}
