import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPRESA_ID } from "~/config/empresa";
import {
  listarEmpresaConfig,
  salvarEmpresaConfig,
  verificarSlugDisponivel,
  listarSecoes,
  criarSecao,
  atualizarSecao,
  deletarSecao,
  listarLinks,
  criarLink,
  atualizarLink,
  deletarLink,
  reordenarLinks,
  reordenarSecoes,
  listarAnalytics,
} from "../services/empresa";
import type {
  EmpresaLinkInput,
  EmpresaSectionInput,
  AnalyticsPeriodo,
} from "../types-empresa";

export function useEmpresaConfig(empresaId?: string | null) {
  const eid = empresaId ?? EMPRESA_ID;
  return useQuery({
    queryKey: ["empresa-linktree-config", eid],
    queryFn: () => listarEmpresaConfig(eid!),
    enabled: !!eid,
    staleTime: 30_000,
  });
}

export function useSalvarEmpresaConfig(empresaId?: string | null) {
  const eid = empresaId ?? EMPRESA_ID;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Parameters<typeof salvarEmpresaConfig>[1]) =>
      salvarEmpresaConfig(eid!, config),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-config"] }),
  });
}

export function useSlugDisponivel(slug: string, empresaId?: string) {
  return useQuery({
    queryKey: ["slug-disponivel", slug],
    queryFn: () => verificarSlugDisponivel(slug, empresaId),
    enabled: slug.length >= 3,
    staleTime: 5_000,
  });
}

export function useSecoes(empresaId?: string | null) {
  const eid = empresaId ?? EMPRESA_ID;
  return useQuery({
    queryKey: ["empresa-linktree-secoes", eid],
    queryFn: () => listarSecoes(eid!),
    enabled: !!eid,
  });
}

export function useCriarSecao(empresaId?: string | null) {
  const eid = empresaId ?? EMPRESA_ID;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EmpresaSectionInput) => criarSecao(eid!, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-secoes"] }),
  });
}

export function useAtualizarSecao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<EmpresaSectionInput>;
    }) => atualizarSecao(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-secoes"] }),
  });
}

export function useDeletarSecao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarSecao(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-secoes"] }),
  });
}

export function useLinks(empresaId?: string | null) {
  const eid = empresaId ?? EMPRESA_ID;
  return useQuery({
    queryKey: ["empresa-linktree-links", eid],
    queryFn: () => listarLinks(eid!),
    enabled: !!eid,
  });
}

export function useCriarLink(empresaId?: string | null) {
  const eid = empresaId ?? EMPRESA_ID;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      input,
    }: {
      sectionId: string;
      input: EmpresaLinkInput;
    }) => criarLink(eid!, sectionId, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-links"] }),
  });
}

export function useAtualizarLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<EmpresaLinkInput>;
    }) => atualizarLink(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-links"] }),
  });
}

export function useDeletarLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarLink(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-links"] }),
  });
}

export function useReordenarLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ordens: { id: string; ordem: number }[]) =>
      reordenarLinks(ordens),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-links"] }),
  });
}

export function useReordenarSecoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ordens: { id: string; ordem: number }[]) =>
      reordenarSecoes(ordens),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["empresa-linktree-secoes"] }),
  });
}

export function useAnalytics(
  periodo: AnalyticsPeriodo,
  empresaId?: string | null,
) {
  const eid = empresaId ?? EMPRESA_ID;
  return useQuery({
    queryKey: ["empresa-linktree-analytics", eid, periodo],
    queryFn: () => listarAnalytics(eid!, periodo),
    enabled: !!eid,
    staleTime: 60_000,
  });
}
