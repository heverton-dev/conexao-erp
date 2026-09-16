import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface ModelMeta {
  id: string;
  name: string;
  description?: string;
  family?: string;
  attachment?: boolean;
  reasoning?: boolean;
  tool_call?: boolean;
  structured_output?: boolean;
  temperature?: boolean;
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
  modalities?: { input?: string[]; output?: string[] };
  open_weights?: boolean;
  limit?: { context?: number; input?: number; output?: number };
}

interface ApiModel {
  id: string;
  cost?: {
    input?: number;
    output?: number;
    cache_read?: number;
    cache_write?: number;
    reasoning?: number;
  };
  limit?: { context?: number; input?: number; output?: number };
  modalities?: { input?: string[]; output?: string[] };
}

interface ApiProvider {
  id?: string;
  name?: string;
  models?: Record<string, ApiModel>;
}

interface ArenaModel {
  id: string;
  displayName: string;
  providerDisplayName: string;
  modality: string[];
  overallWinRate?: number;
  topArenaDisplay?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  inputCostPerMTokens?: number;
  outputCostPerMTokens?: number;
}

interface ModeloOutput {
  modelo_id: string;
  nome: string;
  provedor: string;
  modalidade: string;
  win_rate: number | null;
  top_arena: string | null;
  input_cost: number | null;
  output_cost: number | null;
  context_window: number | null;
  max_output: number | null;
  reasoning: boolean | null;
  tool_call: boolean | null;
  structured_output: boolean | null;
  temperature: boolean | null;
  open_weights: boolean | null;
  knowledge: string | null;
  release_date: string | null;
  last_updated: string | null;
  modalities_input: string | null;
  modalities_output: string | null;
  providers_count: number;
}

function parseNum(v: unknown): number | null {
  if (typeof v === "number" && !isNaN(v)) return v;
  return null;
}

function suffix(id: string): string {
  const i = id.lastIndexOf("/");
  return i === -1 ? id : id.slice(i + 1);
}

function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ---------- DesignArena scraping ----------

function extractArenaModels(html: string): ArenaModel[] {
  // DesignArena embute os dados via Next.js __next_f com aspas escapadas: \"rows\":[...]
  const marker = '\\"rows\\":';
  const idx = html.indexOf(marker);
  if (idx === -1) return [];

  const arrStart = html.indexOf("[", idx);
  if (arrStart === -1) return [];

  let depth = 0;
  let end = arrStart;
  for (let i = arrStart; i < html.length; i++) {
    if (html[i] === "[") depth++;
    else if (html[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  let raw = html.substring(arrStart, end);
  raw = raw.replace(/\\"/g, '"');

  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as ArenaModel[]) : [];
  } catch {
    return [];
  }
}

// ---------- Main ----------

serve(async (req: Request) => {
  const allowedOrigin = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", detail: authError?.message }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_super_admin) {
    return new Response(
      JSON.stringify({ error: "Forbidden", detail: profileError?.message }),
      { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  try {
    // 1. models.dev metadata (provider-agnostic, 247 modelos únicos)
    const metaRes = await fetch("https://models.dev/models.json", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!metaRes.ok) throw new Error(`models.dev models.json: ${metaRes.status}`);
    const metaJson = (await metaRes.json()) as Record<string, ModelMeta>;
    const metas = Object.values(metaJson);

    // 2. models.dev api (provider-specific: custo + quantos providers servem)
    const apiRes = await fetch("https://models.dev/api.json", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!apiRes.ok) throw new Error(`models.dev api.json: ${apiRes.status}`);
    const apiJson = (await apiRes.json()) as Record<string, ApiProvider>;

    const apiById: Record<string, { cost?: ApiModel["cost"]; providers: string[] }> = {};
    for (const prov of Object.values(apiJson)) {
      if (!prov.models) continue;
      for (const [mid, m] of Object.entries(prov.models)) {
        if (!apiById[mid]) apiById[mid] = { providers: [] };
        const provName = prov.id ?? prov.name ?? "";
        if (provName && !apiById[mid].providers.includes(provName)) {
          apiById[mid].providers.push(provName);
        }
        if (m.cost && !apiById[mid].cost) apiById[mid].cost = m.cost;
      }
    }

    // 3. DesignArena (win rate + top arena)
    const arenaRes = await fetch("https://www.designarena.ai/models", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    let arenaByName: Record<string, ArenaModel> = {};
    let arenaBySuffix: Record<string, ArenaModel> = {};
    if (arenaRes.ok) {
      const html = await arenaRes.text();
      const arenaModels = extractArenaModels(html);
      for (const a of arenaModels) {
        arenaByName[normName(a.displayName)] = a;
        arenaBySuffix[suffix(a.id)] = a;
      }
    }

    // 4. Merge
    const models: ModeloOutput[] = [];
    for (const m of metas) {
      const outMod = m.modalities?.output ?? [];
      // só modelos com saída de texto (LLM tracker)
      if (!outMod.includes("text")) continue;

      const mid = m.id;
      const apiEntry = apiById[mid] ?? apiById[suffix(mid)];
      const cost = apiEntry?.cost;
      const providersCount = apiEntry?.providers.length ?? 0;

      const provPart = mid.includes("/") ? mid.split("/")[0] : "";

      // match DesignArena
      const arena =
        arenaByName[normName(m.name)] ??
        arenaBySuffix[suffix(mid)] ??
        null;

      models.push({
        modelo_id: mid,
        nome: m.name,
        provedor: provPart,
        modalidade: (m.modalities?.input ?? []).join(", "),
        win_rate: arena ? parseNum(arena.overallWinRate) : null,
        top_arena: arena?.topArenaDisplay ?? null,
        input_cost: cost ? parseNum(cost.input) : (arena ? parseNum(arena.inputCostPerMTokens) : null),
        output_cost: cost ? parseNum(cost.output) : (arena ? parseNum(arena.outputCostPerMTokens) : null),
        context_window: m.limit?.context != null
          ? m.limit.context
          : (arena ? parseNum(arena.contextWindow) : null),
        max_output: m.limit?.output != null
          ? m.limit.output
          : (arena ? parseNum(arena.maxOutputTokens) : null),
        reasoning: m.reasoning ?? null,
        tool_call: m.tool_call ?? null,
        structured_output: m.structured_output ?? null,
        temperature: m.temperature ?? null,
        open_weights: m.open_weights ?? null,
        knowledge: m.knowledge ?? null,
        release_date: m.release_date ?? null,
        last_updated: m.last_updated ?? null,
        modalities_input: (m.modalities?.input ?? []).join(", ") || null,
        modalities_output: (m.modalities?.output ?? []).join(", ") || null,
        providers_count: providersCount,
      });
    }

    return new Response(JSON.stringify({ total: models.length, models }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
