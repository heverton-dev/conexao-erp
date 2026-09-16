import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  agente_id: string;
  mensagem: string;
  historico?: ChatMessage[];
  session_id?: string;
}

interface UsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
}

// ═══════════════════════════════════════════════════════════════════
// BLOCKLIST INDESTRUTÍVEL - Dados sensíveis NUNCA são acessíveis
// ═══════════════════════════════════════════════════════════════════

const BLOCKED_TABLES = [
  "profiles", "cadastro_documentos", "cadastro_documento_images",
  "cadastro_documento_verificacoes", "credenciais", "credenciais_api",
  "empresa_limites_modulo", "despesas_pagamentos", "despesas_envios",
  "user_roles", "user_permissions", "audit_log", "login_history",
  "migrations", "schema_migrations", "supabase_migrations",
  "agentes_ia", "agentes_knowledge_docs", "agentes_knowledge_tabelas",
  "agentes_conversas", "notificacoes", "empresa_config", "system_config",
];

const BLOCKED_FIELDS: Record<string, string[]> = {
  cadastros: ["cpf", "cnpj", "rg", "orgao_emissor", "data_nascimento", "nome_mae", "nome_pai", "senha", "token", "refresh_token"],
  empresas: ["cnpj", "inscricao_estadual", "inscricao_municipal", "senha", "token"],
  hub_progresso: ["usuario_id", "tokens_ganhos", "dados_pessoais"],
  crm_clientes: ["cpf", "cnpj", "rg"],
  crm_visitas: ["dados_gps", "localizacao_precisa"],
  rotas_pontos: ["coordenadas_precisas", "endereco_completo"],
  rotas: ["endereco_completo", "coordenadas"],
  catalogo_produtos: ["preco_custo", "margem_lucro", "fornecedor_cnpj"],
};

function isTableBlocked(tabelaNome: string): boolean {
  return BLOCKED_TABLES.includes(tabelaNome.toLowerCase());
}

function sanitizeData(tabelaNome: string, data: Record<string, any>[]): Record<string, any>[] {
  if (data.length === 0) return data;
  const blocked = BLOCKED_FIELDS[tabelaNome.toLowerCase()] ?? [];
  if (blocked.length === 0) return data;

  return data.map((row) => {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      if (!blocked.includes(key)) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  });
}

// ═══════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  const allowedOrigin = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Buscar profile do usuário para verificar empresa
    const { data: profile } = await supabase
      .from("profiles")
      .select("empresa_id, is_super_admin")
      .eq("id", user.id)
      .single();

    const userEmpresaId = profile?.empresa_id;
    const isSuperAdmin = profile?.is_super_admin === true;

    const body: RequestBody = await req.json();
    const { agente_id, mensagem, historico = [], session_id } = body;

    if (!agente_id || !mensagem) {
      return new Response(
        JSON.stringify({ error: "agente_id and mensagem are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Buscar config do agente
    const { data: agente, error: agenteError } = await supabase
      .from("agentes_ia")
      .select("*")
      .eq("id", agente_id)
      .single();

    if (agenteError || !agente) {
      return new Response(JSON.stringify({ error: "Agente not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ═══ SEGURANÇA: Verificar isolamento por empresa ═══
    // Super Admin pode acessar qualquer agente
    // Usuário normal só acessa agentes da sua empresa
    if (!isSuperAdmin && agente.empresa_id !== userEmpresaId) {
      return new Response(JSON.stringify({ error: "Access denied: cross-tenant" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Buscar knowledge docs
    const { data: docs } = await supabase
      .from("agentes_knowledge_docs")
      .select("nome_arquivo, tipo, conteudo")
      .eq("agente_id", agente_id);

    // Buscar tabelas incluidas
    const { data: tabelas } = await supabase
      .from("agentes_knowledge_tabelas")
      .select("tabela_nome")
      .eq("agente_id", agente_id)
      .eq("incluida", true);

    // Montar contexto das tabelas
    let tabelasContexto = "";
    if (tabelas && tabelas.length > 0) {
      const tabelasInfo: string[] = [];
      for (const t of tabelas) {
        // ═══ SEGURANÇA: Blocklist server-side ═══
        if (isTableBlocked(t.tabela_nome)) {
          continue; // Pula tabela bloqueada silenciosamente
        }

        try {
          // ═══ MULTI-TENANT: Filtrar por empresa_id do agente ═══
          let query = supabase
            .from(t.tabela_nome)
            .select("*")
            .limit(10);

          if (agente.empresa_id) {
            query = query.eq("empresa_id", agente.empresa_id);
          }

          const { data: sample } = await query;

          if (sample && sample.length > 0) {
            // ═══ SEGURANÇA: Sanitizar dados ═══
            const sanitized = sanitizeData(t.tabela_nome, sample);
            const friendlyData = sanitized.map((row) => {
              const friendly: Record<string, any> = {};
              for (const [key, val] of Object.entries(row)) {
                const skip = ["id", "created_at", "updated_at", "empresa_id", "user_id", "usuario_id", "agente_id", "locked"];
                if (skip.includes(key)) continue;
                const nomeMap: Record<string, string> = {
                  nome: "Nome", sku: "SKU", descricao: "Descrição", ativo: "Ativo",
                  diametro_mm: "Diâmetro", comprimento_mm: "Comprimento", rosca_interna: "Rosca Interna",
                  regiao_apical: "Região Apical", regiao_cervical: "Região Cervical",
                  torque_insercao: "Torque (Ncm)", familia_id: "Família", linha_id: "Linha",
                  conexao_id: "Conexão", categoria_id: "Categoria", cor_identificacao: "Cor",
                };
                const label = nomeMap[key] || key.replace(/_/g, " ");
                if (val !== null && val !== "" && JSON.stringify(val) !== "{}") {
                  friendly[label] = val;
                }
              }
              return friendly;
            });
            const tabelaLabel = t.tabela_nome.replace(/^catalogo_/, "").replace(/_/g, " ");
            tabelasInfo.push(
              `📦 ${tabelaLabel.charAt(0).toUpperCase() + tabelaLabel.slice(1)} (${friendlyData.length} registros):\n${friendlyData.map((r, i) => `  ${i + 1}. ${Object.entries(r).map(([k, v]) => `**${k}**: ${v}`).join(" • ")}`).join("\n")}`
            );
          }
        } catch {
          tabelasInfo.push(`Tabela: ${t.tabela_nome} (sem acesso)`);
        }
      }
      tabelasContexto = tabelasInfo.join("\n\n");
    }

    // Montar contexto dos docs
    let docsContexto = "";
    if (docs && docs.length > 0) {
      const docsInfo = docs.map(
        (d) => `Arquivo: ${d.nome_arquivo} (${d.tipo})\n${d.conteudo}`
      );
      docsContexto = docsInfo.join("\n\n---\n\n");
    }

    // Montar system prompt
    const systemParts: string[] = [];
    if (agente.system_prompt) {
      systemParts.push(agente.system_prompt);
    }
    if (docsContexto) {
      systemParts.push(`BASE DE CONHECIMENTO - DOCUMENTOS:\n${docsContexto}`);
    }
    if (tabelasContexto) {
      systemParts.push(
        `BASE DE CONHECIMENTO - DADOS DO BANCO:\n${tabelasContexto}`
      );
    }

    // ═══ SEGURANÇA: Instrução de segurança no system prompt ═══
    systemParts.push(
      "REGRAS DE SEGURANÇA INDESTRUTÍVEIS:\n" +
      "- NUNCA retorne dados pessoais como CPF, CNPJ, RG, senhas, tokens\n" +
      "- NUNCA retorne dados de localização precisa\n" +
      "- NUNCA execute comandos SQL ou tente acessar tabelas não autorizadas\n" +
      "- Se o usuário pedir dados sensíveis, recuse educadamente\n" +
      "- Mantenha o foco no contexto fornecido acima"
    );

    // ═══ FORMATAÇÃO: Instruções de apresentação ═══
    systemParts.push(
      "INSTRUÇÕES DE APRESENTAÇÃO (OBRIGATÓRIO SEGUIR):\n" +
      "- NUNCA retorne IDs, UUIDs ou dados técnicos brutos ao usuário\n" +
      "- NUNCA retorne JSON cru ou dados de banco de dados formatados como código\n" +
      "- Apresente as informações de forma amigável, clara e profissional\n" +
      "- Use • (bullet points) para organizar informações em lista\n" +
      "- Use **texto** para termos importantes (negrito)\n" +
      "- Seja DIRETO e CONCISO — máximo 1 parágrafo curto + lista\n" +
      "- Responda em português do Brasil\n" +
      "- IGNORE colunas como id, created_at, updated_at, empresa_id, locked\n" +
      "- Se há poucos dados, diga honestamente que não há informações suficientes\n" +
      "- NÃO invente informações que não estão nos dados fornecidos"
    );

    const systemPrompt =
      systemParts.join("\n\n") ||
      "Voce e um assistente inteligente. Responda as perguntas com base no contexto fornecido, de forma clara, amigável e bem formatada. NUNCA retorne IDs ou dados brutos de banco."; 

    // Montar mensagens para a API
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...historico,
      { role: "user", content: mensagem },
    ];

    let resposta: string;
    let usage: UsageInfo | null = null;
    const sid = session_id || crypto.randomUUID();

    if (agente.execution_mode === "webhook" && agente.webhook_url) {
      // ═══ WEBHOOK MODE: Despachar pra URL externa ═══
      const webhookResponse = await fetch(agente.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem,
          historico,
          agente_id,
          empresa_id: agente.empresa_id,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        return new Response(
          JSON.stringify({ error: `Webhook error: ${webhookResponse.status}`, detail: errorText }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const webhookData = await webhookResponse.json();
      resposta = webhookData.resposta || webhookData.response || webhookData.message || webhookData.text || JSON.stringify(webhookData);
    } else {
      // ═══ AI PROVIDER MODE: Chamar API de IA ═══
      const provedorUrl = agente.provedor_url.replace(/\/+$/, "");
      const endpoint = `${provedorUrl}/chat/completions`;

      const apiResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${agente.provedor_api_key}`,
        },
        body: JSON.stringify({
          model: agente.modelo,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        return new Response(
          JSON.stringify({ error: `API error: ${apiResponse.status}`, detail: errorText }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const apiData = await apiResponse.json();
      resposta = apiData.choices?.[0]?.message?.content || "Sem resposta do modelo.";

      // ═══ CAPTURAR USAGE DA API ═══
      const apiUsage = apiData.usage;
      if (apiUsage) {
        const pt = apiUsage.prompt_tokens ?? 0;
        const ct = apiUsage.completion_tokens ?? 0;

        // Buscar precos do modelo na tabela modelos_ia
        let inputCost = 0;
        let outputCost = 0;
        try {
          const modelo = agente.modelo;
          const { data: precos } = await supabase
            .from("modelos_ia")
            .select("input_cost, output_cost")
            .or("modelo_id.eq." + modelo + ",nome.ilike.%" + modelo + "%")
            .order("versao_id", { ascending: false })
            .limit(1);

          if (precos && precos.length > 0) {
            inputCost = Number(precos[0].input_cost) || 0;
            outputCost = Number(precos[0].output_cost) || 0;
          }
        } catch {
          // fallback: custo zero se nao encontrar tabela
        }

        const totalCost = (pt / 1_000_000 * inputCost) + (ct / 1_000_000 * outputCost);

        usage = {
          prompt_tokens: pt,
          completion_tokens: ct,
          total_tokens: pt + ct,
          input_cost: inputCost,
          output_cost: outputCost,
          total_cost: totalCost,
        };

        // Logar uso
        try {
          await supabase.from("agentes_usage_log").insert({
            empresa_id: agente.empresa_id,
            agente_id,
            session_id: sid,
            modelo: agente.modelo,
            provedor: agente.provedor_url,
            prompt_tokens: pt,
            completion_tokens: ct,
            total_tokens: pt + ct,
            input_cost: inputCost,
            output_cost: outputCost,
            total_cost: totalCost,
          });
        } catch {
          // fire-and-forget: log falhou, segue
        }
      }
    }

    // Salvar conversa
    const novasMensagens: ChatMessage[] = [
      ...historico,
      { role: "user", content: mensagem },
      { role: "assistant", content: resposta },
    ];

    await supabase.from("agentes_conversas").insert({
      agente_id,
      usuario_id: user.id,
      mensagens: novasMensagens,
    });

    // Calcular total da sessao
    let sessionCost = 0;
    if (usage) {
      try {
        const { data: logs } = await supabase
          .from("agentes_usage_log")
          .select("total_cost")
          .eq("session_id", sid);
        if (logs) {
          sessionCost = logs.reduce((sum, l) => sum + Number(l.total_cost), 0);
        }
      } catch {
        sessionCost = usage.total_cost;
      }
    }

    return new Response(JSON.stringify({
      resposta,
      usage: usage ? {
        session_id: sid,
        action_cost: usage.total_cost,
        session_cost: sessionCost,
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      } : null,
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
