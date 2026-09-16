import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarLinks, criarLink, atualizarLink, deletarLink } from "../services/links.service";
import type { TipoLink } from "../types";

export function useLinks() {
  return useQuery({
    queryKey: ["gerador-links"],
    queryFn: () => listarLinks(),
    staleTime: 30_000,
  });
}

export function useCriarLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      tipo: TipoLink;
      titulo: string;
      url_gerada: string;
      params: Record<string, string>;
    }) =>
      criarLink(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gerador-links"] }),
  });
}

export function useEditarLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; titulo?: string; url_gerada?: string; params?: Record<string, string> }) =>
      atualizarLink(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gerador-links"] }),
  });
}

export function useDeletarLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletarLink(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gerador-links"] }),
  });
}
