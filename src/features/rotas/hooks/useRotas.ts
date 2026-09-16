import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPRESA_ID } from "~/config/empresa";
import { useAuth } from "~/lib/auth";
import {
  listarRotas,
  buscarRota,
  buscarRotaComClientes,
  criarRota,
  atualizarRota,
  excluirRota,
  iniciarRota,
  finalizarRota,
  adicionarClientesNaRota,
  removerClienteDaRota,
  reordenarClientes,
} from "../services/rotas.service";
import type { RotaFormData, RotaStatus } from "../types";

export function useRotas(filtros?: {
  status?: RotaStatus;
  data_inicio?: string;
  data_fim?: string;
}) {
  const { user, profile } = useAuth();

  const isSuperAdmin = profile?.is_super_admin;

  return useQuery({
    queryKey: ["rotas", EMPRESA_ID, user?.id, filtros],
    queryFn: () =>
      listarRotas(
        isSuperAdmin ? null : EMPRESA_ID,
        isSuperAdmin ? null : user?.id,
        filtros,
      ),
    enabled: !!user?.id,
  });
}

export function useRota(id: string) {
  return useQuery({
    queryKey: ["rota", id],
    queryFn: () => buscarRota(id),
    enabled: !!id,
  });
}

export function useRotaComClientes(id: string) {
  return useQuery({
    queryKey: ["rota-clientes", id],
    queryFn: () => buscarRotaComClientes(id),
    enabled: !!id,
  });
}

export function useCriarRota() {
  const qc = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: (form: RotaFormData & { empresa_id?: string }) => {
      const empresaId = form.empresa_id || EMPRESA_ID;
      return criarRota(empresaId, user!.id, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rotas"] });
    },
  });
}

export function useAtualizarRota() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof atualizarRota>[1];
    }) => atualizarRota(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rotas"] });
    },
  });
}

export function useExcluirRota() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: excluirRota,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rotas"] });
    },
  });
}

export function useIniciarRota() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      rotaId,
      localizacao,
    }: {
      rotaId: string;
      localizacao: { lat: number; lng: number };
    }) => iniciarRota(rotaId, localizacao),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rotas"] });
    },
  });
}

export function useFinalizarRota() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      rotaId,
      localizacao,
      stats,
    }: {
      rotaId: string;
      localizacao: { lat: number; lng: number };
      stats: {
        total_visitas: number;
        total_km: number;
        total_tempo_trajeto_min: number;
        valor_reembolso: number;
      };
    }) => finalizarRota(rotaId, localizacao, stats),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rotas"] });
    },
  });
}

export function useAdicionarClientesNaRota() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      rotaId,
      clienteIds,
    }: {
      rotaId: string;
      clienteIds: string[];
    }) => adicionarClientesNaRota(rotaId, EMPRESA_ID, clienteIds),
    onSuccess: (_, { rotaId }) => {
      qc.invalidateQueries({ queryKey: ["rota-clientes", rotaId] });
    },
  });
}

export function useRemoverClienteDaRota() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: removerClienteDaRota,
    onSuccess: (_data, rotaClienteId) => {
      qc.invalidateQueries({ queryKey: ["rotas"] });
      qc.invalidateQueries({ queryKey: ["rota-clientes"] });
    },
  });
}

export function useReordenarClientes() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      rotaId,
      clienteIds,
    }: {
      rotaId: string;
      clienteIds: string[];
    }) => reordenarClientes(rotaId, clienteIds),
    onSuccess: (_, { rotaId }) => {
      qc.invalidateQueries({ queryKey: ["rota-clientes", rotaId] });
    },
  });
}
