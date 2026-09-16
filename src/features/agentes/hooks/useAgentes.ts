import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarAgentes,
  listarTodosAgentes,
  buscarAgente,
  criarAgente,
  atualizarAgente,
  deletarAgente,
  toggleAgenteAtivo,
  listarKnowledgeDocs,
  uploadKnowledgeDoc,
  deletarKnowledgeDoc,
  listarKnowledgeTabelas,
  toggleTabela,
  enviarMensagemPlayground,
  listarConversas,
  deletarConversas,
  testarConexaoApi,
  buscarModelosDisponiveis,
  listarProvedores,
  buscarProvedor,
  criarProvedor,
  atualizarProvedor,
  deletarProvedor,
  reordenarProvedores,
} from "../service";
import type { CriarAgenteInput, UpdateAgenteInput, ChatMessage, CriarProvedorInput, UpdateProvedorInput } from "../types";

// ── Agentes ───────────────────────────────────────────────────

export function useAgentes() {
  return useQuery({
    queryKey: ["agentes-ia"],
    queryFn: () => listarAgentes(),
  });
}

export function useTodosAgentes() {
  return useQuery({
    queryKey: ["agentes-ia", "all"],
    queryFn: () => listarTodosAgentes(),
  });
}

export function useAgente(id: string | undefined) {
  return useQuery({
    queryKey: ["agentes-ia", "detail", id],
    queryFn: () => buscarAgente(id!),
    enabled: !!id,
  });
}

export function useCriarAgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarAgenteInput) => criarAgente(input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["agentes-ia"] });
    },
  });
}

export function useAtualizarAgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAgenteInput) => atualizarAgente(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agentes-ia"] });
    },
  });
}

export function useDeletarAgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarAgente(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agentes-ia"] });
    },
  });
}

export function useToggleAgenteAtivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      toggleAgenteAtivo(id, ativo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agentes-ia"] });
    },
  });
}

// ── Knowledge Docs ────────────────────────────────────────────

export function useKnowledgeDocs(agenteId: string | undefined) {
  return useQuery({
    queryKey: ["agentes-ia", "docs", agenteId],
    queryFn: () => listarKnowledgeDocs(agenteId!),
    enabled: !!agenteId,
  });
}

export function useUploadKnowledgeDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agenteId, file }: { agenteId: string; file: File }) =>
      uploadKnowledgeDoc(agenteId, file),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["agentes-ia", "docs", vars.agenteId] });
    },
  });
}

export function useDeletarKnowledgeDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agenteId }: { id: string; agenteId: string }) =>
      deletarKnowledgeDoc(id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["agentes-ia", "docs", vars.agenteId] });
    },
  });
}

// ── Knowledge Tabelas ─────────────────────────────────────────

export function useKnowledgeTabelas(agenteId: string | undefined) {
  return useQuery({
    queryKey: ["agentes-ia", "tabelas", agenteId],
    queryFn: () => listarKnowledgeTabelas(agenteId!),
    enabled: !!agenteId,
  });
}

export function useToggleTabela() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      agenteId,
      tabelaNome,
      incluida,
    }: {
      agenteId: string;
      tabelaNome: string;
      incluida: boolean;
    }) => toggleTabela(agenteId, tabelaNome, incluida),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["agentes-ia", "tabelas", vars.agenteId] });
    },
  });
}

// ── Playground ────────────────────────────────────────────────

export function useEnviarMensagem() {
  return useMutation({
    mutationFn: ({
      agenteId,
      mensagem,
      historico,
    }: {
      agenteId: string;
      mensagem: string;
      historico?: ChatMessage[];
    }) => enviarMensagemPlayground(agenteId, mensagem, historico),
  });
}

export function useConversas(agenteId: string | undefined) {
  return useQuery({
    queryKey: ["agentes-ia", "conversas", agenteId],
    queryFn: () => listarConversas(agenteId!),
    enabled: !!agenteId,
  });
}

export function useDeletarConversas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agenteId: string) => deletarConversas(agenteId),
    onSuccess: (_data, agenteId) => {
      qc.invalidateQueries({ queryKey: ["agentes-ia", "conversas", agenteId] });
    },
  });
}

// ── Teste Conexão ─────────────────────────────────────────────

export function useTestarConexao() {
  return useMutation({
    mutationFn: ({
      provedorUrl,
      apiKey,
      modelo,
    }: {
      provedorUrl: string;
      apiKey: string;
      modelo: string;
    }) => testarConexaoApi(provedorUrl, apiKey, modelo),
  });
}

export function useBuscarModelos() {
  return useMutation({
    mutationFn: ({ provedorUrl, apiKey }: { provedorUrl: string; apiKey: string }) =>
      buscarModelosDisponiveis(provedorUrl, apiKey),
  });
}

// ── Provedores IA ────────────────────────────────────────────────

export function useProvedores() {
  return useQuery({
    queryKey: ["provedores-ia"],
    queryFn: () => listarProvedores(),
  });
}

export function useProvedor(id: string | undefined) {
  return useQuery({
    queryKey: ["provedores-ia", "detail", id],
    queryFn: () => buscarProvedor(id!),
    enabled: !!id,
  });
}

export function useCriarProvedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarProvedorInput) => criarProvedor(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provedores-ia"] });
    },
  });
}

export function useAtualizarProvedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProvedorInput) => atualizarProvedor(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provedores-ia"] });
    },
  });
}

export function useDeletarProvedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletarProvedor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provedores-ia"] });
    },
  });
}

export function useReordenarProvedores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reordenarProvedores(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provedores-ia"] });
    },
  });
}
