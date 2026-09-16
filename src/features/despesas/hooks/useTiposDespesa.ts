import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import {
  listarTiposDespesa,
  listarTiposDespesaAtivos,
  criarTipoDespesa,
  atualizarTipoDespesa,
  excluirTipoDespesa,
} from "../services/tipos.service";
import type { DespesaTipo } from "../types";

export function useTiposDespesa(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useQuery({
    queryKey: ["despesas-tipos", empresa_id],
    queryFn: () => listarTiposDespesa(),
    enabled: !!empresa_id,
  });
}

export function useTiposDespesaAtivos(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useQuery({
    queryKey: ["despesas-tipos-ativos", empresa_id],
    queryFn: () => listarTiposDespesaAtivos(),
    enabled: !!empresa_id,
  });
}

export function useCriarTipoDespesa(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useMutation({
    mutationFn: (tipo: Partial<DespesaTipo>) =>
      criarTipoDespesa({ ...tipo, empresa_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-tipos", empresa_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["despesas-tipos-ativos", empresa_id],
      });
    },
  });
}

export function useAtualizarTipoDespesa(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DespesaTipo>;
    }) => atualizarTipoDespesa(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-tipos", empresa_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["despesas-tipos-ativos", empresa_id],
      });
    },
  });
}

export function useExcluirTipoDespesa(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useMutation({
    mutationFn: (id: string) => excluirTipoDespesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-tipos", empresa_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["despesas-tipos-ativos", empresa_id],
      });
    },
  });
}
