import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPRESA_ID } from "~/config/empresa";
import {
  listarColaboradores,
  toggleColaboradorStatus,
  deletarColaborador,
} from "..";
import type { LinktreeColaboradorComCredencial } from "../types";

export function useColaboradores(filtroEmpresa?: string) {
  const empresaId = filtroEmpresa ?? EMPRESA_ID;
  return useQuery({
    queryKey: ["linktree-colaboradores", empresaId],
    queryFn: () => listarColaboradores(empresaId),
    staleTime: 30_000,
  });
}

export function useToggleColaborador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ativo" | "inativo";
    }) => toggleColaboradorStatus(id, status),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["linktree-colaboradores"] }),
  });
}

export function useDeletarColaborador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarColaborador(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["linktree-colaboradores"] }),
  });
}
