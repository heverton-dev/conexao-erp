import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import {
  listarMinhasDespesas,
  listarDespesasEmpresa,
  buscarDespesa,
  criarDespesa,
  atualizarDespesa,
  excluirDespesa,
  enviarDespesas,
  aprovarDespesa,
  reprovarDespesa,
  uploadComprovante,
} from "../services/despesas.service";
import type { DespesaFormData, DespesaFiltros, Despesa } from "../types";

export function useMinhasDespesas(
  filtros?: DespesaFiltros,
  overrideEmpresaId?: string,
) {
  const { profile } = useAuth();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;
  const usuario_id = profile?.id ?? "";

  return useQuery({
    queryKey: ["minhas-despesas", empresa_id, usuario_id, filtros],
    queryFn: () => listarMinhasDespesas(usuario_id, filtros),
    enabled: !!empresa_id && !!usuario_id,
  });
}

export function useDespesasEmpresa(
  filtros?: DespesaFiltros,
  overrideEmpresaId?: string,
) {
  const { profile } = useAuth();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useQuery({
    queryKey: ["despesas-empresa", empresa_id, filtros],
    queryFn: () => listarDespesasEmpresa(filtros),
    enabled: !!empresa_id,
  });
}

export function useDespesa(id: string) {
  return useQuery({
    queryKey: ["despesa", id],
    queryFn: () => buscarDespesa(id),
    enabled: !!id,
  });
}

export function useCriarDespesa() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = EMPRESA_ID;
  const usuario_id = profile?.id ?? "";

  return useMutation({
    mutationFn: async ({
      despesa,
      file,
    }: {
      despesa: DespesaFormData;
      file?: File;
    }) => {
      let comprovante_url = despesa.comprovante_url;

      if (file && despesa.comprovante_tipo === "upload") {
        const tempId = crypto.randomUUID();
        comprovante_url = await uploadComprovante(
          usuario_id,
          tempId,
          file,
        );
      }

      return criarDespesa(usuario_id, {
        ...despesa,
        comprovante_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["minhas-despesas", empresa_id],
      });
    },
  });
}

export function useAtualizarDespesa() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = EMPRESA_ID;

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Despesa> }) =>
      atualizarDespesa(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["minhas-despesas", empresa_id],
      });
    },
  });
}

export function useExcluirDespesa() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = EMPRESA_ID;

  return useMutation({
    mutationFn: (id: string) => excluirDespesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["minhas-despesas", empresa_id],
      });
    },
  });
}

export function useEnviarDespesas() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = EMPRESA_ID;
  const usuario_id = profile?.id ?? "";

  return useMutation({
    mutationFn: (periodo_id: string) => enviarDespesas(periodo_id, usuario_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["minhas-despesas", empresa_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["despesas-envios", empresa_id],
      });
    },
  });
}

export function useAprovarDespesa() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = EMPRESA_ID;

  return useMutation({
    mutationFn: (id: string) => aprovarDespesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-empresa", empresa_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["despesas-envios", empresa_id],
      });
    },
  });
}

export function useReprovarDespesa() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = EMPRESA_ID;

  return useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario: string }) =>
      reprovarDespesa(id, comentario),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-empresa", empresa_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["despesas-envios", empresa_id],
      });
    },
  });
}
