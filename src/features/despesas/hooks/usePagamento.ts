import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import {
  criarPagamento,
  marcarComoPago,
  cancelarPagamento,
} from "../services/pagamentos.service";
import type { FormaPagamento } from "../types";

export function useCriarPagamento(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useMutation({
    mutationFn: (pagamento: {
      empresa_id: string;
      envio_id: string;
      valor: number;
      forma_pagamento: FormaPagamento;
      data_pagamento: string;
    }) => criarPagamento(pagamento),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-pagamentos", empresa_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["despesas-envios", empresa_id],
      });
    },
  });
}

export function useMarcarComoPago(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useMutation({
    mutationFn: ({ id, comprovante }: { id: string; comprovante?: string }) =>
      marcarComoPago(id, comprovante),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-pagamentos", empresa_id],
      });
    },
  });
}

export function useCancelarPagamento(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useMutation({
    mutationFn: (id: string) => cancelarPagamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesas-pagamentos", empresa_id],
      });
    },
  });
}
