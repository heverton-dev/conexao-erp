import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import { buscarConfig, criarOuAtualizarConfig } from "../services/config.service";
import type { Frequencia } from "../types";

export function useDespesasConfig(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useQuery({
    queryKey: ["despesa-config", empresa_id],
    queryFn: () => buscarConfig(),
    enabled: !!empresa_id,
  });
}

export function useSalvarConfig() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const empresa_id = EMPRESA_ID;

  return useMutation({
    mutationFn: async (config: {
      frequencia: Frequencia;
      dia_envio: number;
      dias_aviso: number;
    }) => criarOuAtualizarConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["despesa-config", empresa_id],
      });
    },
  });
}
