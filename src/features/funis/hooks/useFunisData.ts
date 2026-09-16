import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPRESA_ID } from "~/config/empresa";
import {
  listarFunis,
  buscarFunil,
  criarFunil,
  atualizarFunil,
  deletarFunil,
  criarColuna,
  atualizarColuna,
  reordenarColunas,
  deletarColuna,
  criarTarefa,
  atualizarTarefa,
  moverTarefa,
  reordenarTarefas,
  deletarTarefa,
  listarPermissoesFunil,
  concederPermissao,
  revogarPermissao,
} from "../services";
import type {
  FunilInput,
  FunilColunaInput,
  FunilTarefaInput,
  FunilPermissaoNivel,
} from "../types";

export function useFunis() {
  return useQuery({
    queryKey: ["funis", EMPRESA_ID],
    queryFn: () => listarFunis(),
    staleTime: 30_000,
  });
}

export function useFunil(id: string | null) {
  return useQuery({
    queryKey: ["funil", id],
    queryFn: () => buscarFunil(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useCriarFunil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FunilInput) => criarFunil(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funis"] }),
  });
}

export function useAtualizarFunil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<FunilInput> }) =>
      atualizarFunil(id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["funis", EMPRESA_ID] });
      qc.invalidateQueries({ queryKey: ["funil", id] });
    },
  });
}

export function useDeletarFunil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletarFunil,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["funis", EMPRESA_ID] }),
  });
}

export function useCriarColuna() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FunilColunaInput) => criarColuna(input),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["funil", vars.funil_id] }),
  });
}

export function useAtualizarColuna() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      titulo,
      input,
    }: {
      id: string;
      titulo?: string;
      input?: Partial<FunilColunaInput>;
    }) => atualizarColuna(id, input ?? { titulo: titulo! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funil"] }),
  });
}

export function useReordenarColunas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reordenarColunas,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funil"] }),
  });
}

export function useDeletarColuna() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletarColuna,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funil"] }),
  });
}

export function useCriarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FunilTarefaInput) => criarTarefa(input),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["funil", vars.funil_id] }),
  });
}

export function useAtualizarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof atualizarTarefa>[1];
    }) => atualizarTarefa(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funil"] }),
  });
}

export function useMoverTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tarefaId,
      novaColunaId,
      novaPosicao,
    }: {
      tarefaId: string;
      novaColunaId: string;
      novaPosicao: number;
    }) => moverTarefa(tarefaId, novaColunaId, novaPosicao),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funil"] }),
  });
}

export function useReordenarTarefas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      colunaId,
      tarefaIds,
    }: {
      colunaId: string;
      tarefaIds: string[];
    }) => reordenarTarefas(colunaId, tarefaIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funil"] }),
  });
}

export function useDeletarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletarTarefa,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funil"] }),
  });
}

export function usePermissoesFunil(funilId: string | null) {
  return useQuery({
    queryKey: ["funis", "permissoes", funilId],
    queryFn: () => listarPermissoesFunil(funilId!),
    enabled: !!funilId,
  });
}

export function useConcederPermissao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      funilId,
      userId,
      nivel,
    }: {
      funilId: string;
      userId: string;
      nivel: FunilPermissaoNivel;
    }) => concederPermissao(funilId, userId, nivel),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["funis", "permissoes", vars.funilId] }),
  });
}

export function useRevogarPermissao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revogarPermissao,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["funis", "permissoes"] }),
  });
}
