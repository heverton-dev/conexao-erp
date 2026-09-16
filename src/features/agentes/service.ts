import { supabase } from "~/core/supabase/client";
import type {
  AgenteIA,
  AgenteKnowledgeDoc,
  AgenteKnowledgeTabela,
  AgenteConversa,
  ChatMessage,
  CriarAgenteInput,
  UpdateAgenteInput,
  UsageInfo,
  AgenteUsageLog,
  ProvedorIA,
  CriarProvedorInput,
  UpdateProvedorInput,
} from "./types";

// ── Agentes CRUD ──────────────────────────────────────────────

export async function listarAgentes(): Promise<AgenteIA[]> {
  const { data, error } = await supabase
    .from("agentes_ia")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listarTodosAgentes(): Promise<AgenteIA[]> {
  const { data, error } = await supabase
    .from("agentes_ia")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function buscarAgente(id: string): Promise<AgenteIA | null> {
  const { data, error } = await supabase
    .from("agentes_ia")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function criarAgente(
  input: CriarAgenteInput
): Promise<AgenteIA> {
  const { data, error } = await supabase
    .from("agentes_ia")
    .insert({
      nome: input.nome,
      modulo_key: input.modulo_key,
      route: input.route ?? null,
      provedor_url: input.provedor_url,
      provedor_api_key: input.provedor_api_key,
      modelo: input.modelo,
      system_prompt: input.system_prompt ?? null,
      render_mode: input.render_mode,
      execution_mode: input.execution_mode ?? "ai_provider",
      webhook_url: input.webhook_url ?? null,
      redes_sociais: input.redes_sociais ?? null,
      google_drive_folder_url: input.google_drive_folder_url ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarAgente(
  input: UpdateAgenteInput
): Promise<AgenteIA> {
  const { id, ...fields } = input;
  const { data, error } = await supabase
    .from("agentes_ia")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletarAgente(id: string): Promise<void> {
  const { error } = await supabase.from("agentes_ia").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleAgenteAtivo(
  id: string,
  ativo: boolean
): Promise<void> {
  const { error } = await supabase
    .from("agentes_ia")
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ── Knowledge Docs ────────────────────────────────────────────

export async function listarKnowledgeDocs(
  agenteId: string
): Promise<AgenteKnowledgeDoc[]> {
  const { data, error } = await supabase
    .from("agentes_knowledge_docs")
    .select("*")
    .eq("agente_id", agenteId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadKnowledgeDoc(
  agenteId: string,
  file: File
): Promise<AgenteKnowledgeDoc> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  let tipo: AgenteKnowledgeDoc["tipo"] = "documento";
  if (ext === "csv") tipo = "csv";
  else if (ext === "json") tipo = "json";
  else if (ext === "html" || ext === "htm") tipo = "html";
  else if (ext === "pdf") tipo = "pdf";

  const conteudo = await readFileAsText(file);

  const { data, error } = await supabase
    .from("agentes_knowledge_docs")
    .insert({
      agente_id: agenteId,
      tipo,
      nome_arquivo: file.name,
      conteudo,
      tamanho_bytes: file.size,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletarKnowledgeDoc(id: string): Promise<void> {
  const { error } = await supabase
    .from("agentes_knowledge_docs")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Knowledge Tabelas ─────────────────────────────────────────

export async function listarKnowledgeTabelas(
  agenteId: string
): Promise<AgenteKnowledgeTabela[]> {
  const { data, error } = await supabase
    .from("agentes_knowledge_tabelas")
    .select("*")
    .eq("agente_id", agenteId)
    .order("tabela_nome");
  if (error) throw error;
  return data ?? [];
}

export async function toggleTabela(
  agenteId: string,
  tabelaNome: string,
  incluida: boolean
): Promise<void> {
  const { error } = await supabase
    .from("agentes_knowledge_tabelas")
    .upsert(
      { agente_id: agenteId, tabela_nome: tabelaNome, incluida },
      { onConflict: "agente_id,tabela_nome" }
    );
  if (error) throw error;
}

// ── Playground / Chat ─────────────────────────────────────────

export async function enviarMensagemPlayground(
  agenteId: string,
  mensagem: string,
  historico: ChatMessage[] = [],
  sessionId?: string
): Promise<{ resposta: string; usage: UsageInfo | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Não autenticado");

  const sid = sessionId || crypto.randomUUID();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(
    `${supabaseUrl}/functions/v1/agentes-ia-chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ agente_id: agenteId, mensagem, historico, session_id: sid }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${res.status}`);
  }

  const result = await res.json();
  return {
    resposta: result.resposta,
    usage: result.usage ?? null,
  };
}

export async function listarConversas(
  agenteId: string
): Promise<AgenteConversa[]> {
  const { data, error } = await supabase
    .from("agentes_conversas")
    .select("*")
    .eq("agente_id", agenteId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function deletarConversas(agenteId: string): Promise<void> {
  const { error } = await supabase
    .from("agentes_conversas")
    .delete()
    .eq("agente_id", agenteId);
  if (error) throw error;
}

// ── Gastos / Usage ────────────────────────────────────────────

export async function buscarGastosSessao(
  sessionId: string
): Promise<{ total_cost: number; total_tokens: number; chamadas: number }> {
  const { data, error } = await supabase
    .from("agentes_usage_log")
    .select("total_cost, total_tokens")
    .eq("session_id", sessionId);

  if (error) throw error;
  const rows = data ?? [];
  return {
    total_cost: rows.reduce((s, r) => s + Number(r.total_cost), 0),
    total_tokens: rows.reduce((s, r) => s + r.total_tokens, 0),
    chamadas: rows.length,
  };
}

export async function buscarGastosHoje(): Promise<{ total_cost: number; total_tokens: number; chamadas: number }> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("agentes_usage_log")
    .select("total_cost, total_tokens")
    .gte("created_at", hoje.toISOString());

  if (error) throw error;
  const rows = data ?? [];
  return {
    total_cost: rows.reduce((s, r) => s + Number(r.total_cost), 0),
    total_tokens: rows.reduce((s, r) => s + r.total_tokens, 0),
    chamadas: rows.length,
  };
}

export async function buscarGastosAgente(
  agenteId: string,
  dias: number = 30
): Promise<AgenteUsageLog[]> {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const { data, error } = await supabase
    .from("agentes_usage_log")
    .select("*")
    .eq("agente_id", agenteId)
    .gte("created_at", desde.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Helpers ───────────────────────────────────────────────────

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
}

async function chamarProxyIA<T>(acao: "testar" | "modelos", body: Record<string, unknown>): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Não autenticado");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/agentes-testar-conexao`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ acao, ...body }),
    signal: AbortSignal.timeout(20000),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Erro ${res.status}`);
  return json as T;
}

export async function testarConexaoApi(
  provedorUrl: string,
  apiKey: string,
  modelo: string
): Promise<{ ok: boolean; erro?: string }> {
  try {
    return await chamarProxyIA<{ ok: boolean; erro?: string }>("testar", { provedorUrl, apiKey, modelo });
  } catch (e) {
    return { ok: false, erro: (e as Error).message };
  }
}

export async function buscarModelosDisponiveis(
  provedorUrl: string,
  apiKey: string
): Promise<string[]> {
  try {
    const result = await chamarProxyIA<{ modelos: string[] }>("modelos", { provedorUrl, apiKey });
    return result.modelos ?? [];
  } catch {
    return [];
  }
}

// ── Provedores IA ──────────────────────────────────────────────

export async function listarProvedores(): Promise<ProvedorIA[]> {
  const { data, error } = await supabase
    .from("provedores_ia")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function buscarProvedor(id: string): Promise<ProvedorIA | null> {
  const { data, error } = await supabase
    .from("provedores_ia")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function criarProvedor(input: CriarProvedorInput): Promise<ProvedorIA> {
  const { data, error } = await supabase
    .from("provedores_ia")
    .insert({
      nome: input.nome,
      url: input.url,
      api_key_global: input.api_key_global ?? null,
      modelos: input.modelos,
      cor: input.cor ?? "#c9a655",
      icone: input.icone ?? "cpu",
      ativo: input.ativo ?? true,
      ordem: input.ordem ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarProvedor(input: UpdateProvedorInput): Promise<ProvedorIA> {
  const { id, ...fields } = input;
  const { data, error } = await supabase
    .from("provedores_ia")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletarProvedor(id: string): Promise<void> {
  const { error } = await supabase.from("provedores_ia").delete().eq("id", id);
  if (error) throw error;
}

export async function reordenarProvedores(ids: string[]): Promise<void> {
  const updates = ids.map((id, index) =>
    supabase.from("provedores_ia").update({ ordem: index + 1 }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw firstError;
}
