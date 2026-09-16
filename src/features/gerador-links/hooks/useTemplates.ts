import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarTemplates,
  criarTemplate,
  atualizarTemplate,
  deletarTemplate,
} from "../services/templates.service";
import type { TipoTemplate } from "../types";

export function useTemplates() {
  return useQuery({
    queryKey: ["gerador-templates"],
    queryFn: () => listarTemplates(),
    staleTime: 30_000,
  });
}

export function useCriarTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      tipo: TipoTemplate;
      nome: string;
      conteudo: Record<string, string>;
    }) =>
      criarTemplate(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gerador-templates"] }),
  });
}

export function useAtualizarTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; nome?: string; conteudo?: Record<string, string> }) =>
      atualizarTemplate(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gerador-templates"] }),
  });
}

export function useDeletarTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletarTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gerador-templates"] }),
  });
}
