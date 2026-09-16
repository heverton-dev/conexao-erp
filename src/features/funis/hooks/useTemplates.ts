import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPRESA_ID } from "~/config/empresa";
import {
  listarTemplates,
  criarTemplate,
  atualizarTemplate,
  deletarTemplate,
  aplicarTemplate,
} from "../services/templates";
import type { TemplateInput } from "../types";

export function useTemplates() {
  return useQuery({
    queryKey: ["funis-templates", EMPRESA_ID],
    queryFn: () => listarTemplates(EMPRESA_ID),
  });
}

export function useCriarTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TemplateInput) => criarTemplate(input, EMPRESA_ID),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["funis-templates"] }),
  });
}

export function useAtualizarTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TemplateInput>;
    }) => atualizarTemplate(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["funis-templates"] }),
  });
}

export function useDeletarTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarTemplate(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["funis-templates"] }),
  });
}

export function useAplicarTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      funilId,
    }: {
      templateId: string;
      funilId: string;
    }) => aplicarTemplate(templateId, funilId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["funis"] }),
  });
}
