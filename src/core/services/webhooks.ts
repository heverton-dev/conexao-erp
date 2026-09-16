import { supabase } from "~/core/supabase";
import {
  dispararNotificacaoIndividual,
  type NotificacaoTemplate,
} from "~/core/services/notificacoes";
import { getActionExecutor } from "~/registry";

export type Webhook = {
  id: string;
  nome: string;
  evento: string;
  tipo_evento: "status_change" | "button_action";
  url: string;
  metodo: string;
  headers: Record<string, string>;
  body_template: Record<string, any>;
  ativo: boolean;
  ordem?: number;
  created_at: string;
  updated_at: string;
  modulo_key?: string | null;
  evento_key?: string | null;
  evento_custom?: string | null;
};

export type WebhookInput = {
  nome: string;
  evento: string;
  tipo_evento?: "status_change" | "button_action";
  url: string;
  metodo?: string;
  headers?: Record<string, string>;
  body_template?: Record<string, any>;
  ativo?: boolean;
  ordem?: number;
  modulo_key?: string;
  evento_key?: string;
  evento_custom?: string;
};

export type WebhookLog = {
  id: string;
  webhook_id: string | null;
  evento: string | null;
  url: string | null;
  status_code: number | null;
  resposta: string | null;
  sucesso: boolean | null;
  payload_enviado: any;
  created_at: string;
};

export async function listarWebhooks(
  moduloKey?: string | null,
) {
  let query = supabase.from("webhooks").select("*");

  if (moduloKey) {
    query = query.eq("modulo_key", moduloKey);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as Webhook[];
}

export async function criarWebhook(input: WebhookInput) {
  const { data, error } = await supabase
    .from("webhooks")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Webhook;
}

export async function atualizarWebhook(
  id: string,
  input: Partial<WebhookInput>,
) {
  const { data, error } = await supabase
    .from("webhooks")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Webhook;
}

export async function toggleWebhook(id: string, ativo: boolean) {
  return atualizarWebhook(id, { ativo });
}

export async function deletarWebhook(id: string) {
  const { error } = await supabase.from("webhooks").delete().eq("id", id);
  if (error) throw error;
}

export async function listarWebhookLogs(webhookId?: string) {
  let query = supabase
    .from("logs_webhook")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (webhookId) query = query.eq("webhook_id", webhookId);
  const { data, error } = await query;
  if (error) throw error;
  return data as WebhookLog[];
}

type WorkflowTask = {
  id: string;
  type: "notification" | "webhook" | "api_connector";
  ordem: number;
  created_at: string;
  raw: any;
};

export async function dispararWebhooks(
  evento: string,
  payload: Record<string, any>,
) {
  Promise.resolve().then(async () => {
    try {
      let usuarioInfo = {
        usuario_nome: "Sistema",
        usuario_email: "",
        usuario_role: "system",
      };

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("nome, role")
            .eq("id", user.id)
            .maybeSingle();

          usuarioInfo = {
            usuario_nome:
              profile?.nome ||
              user.user_metadata?.nome ||
              user.email ||
              "Usuário",
            usuario_email: user.email || "",
            usuario_role: profile?.role || "user",
          };
        }
      } catch (errUser) {
        console.error("Erro ao buscar dados do usuário realizador:", errUser);
      }

      let cadastroInfo = {};
      const cadastroId = payload.cadastro_id || payload.id;
      if (cadastroId) {
        try {
          const { data: cad } = await supabase
            .from("cadastros")
            .select("*")
            .eq("id", cadastroId)
            .maybeSingle();
          if (cad) {
            cadastroInfo = {
              ...cad,
              lead_nome: cad.colaborador || cad.nome || "",
              email: cad.email || "",
            };
          }
        } catch (errCad) {
          console.error("Erro ao buscar dados completos do cadastro:", errCad);
        }
      }

      let webhooksQuery = supabase
        .from("webhooks")
        .select("*")
        .eq("evento", evento)
        .eq("ativo", true);

      const [notifsRes, webhooksRes, apisRes] = await Promise.all([
        supabase
          .from("notificacoes_modelos")
          .select("*")
          .eq("evento", evento)
          .eq("ativo", true),
        webhooksQuery,
        supabase
          .from("conectores_api")
          .select("*")
          .eq("evento", evento)
          .eq("is_active", true),
      ]);

      const tasks: WorkflowTask[] = [];

      if (notifsRes.data) {
        notifsRes.data.forEach((n: any) => {
          tasks.push({
            id: n.id,
            type: "notification",
            ordem: n.ordem ?? 0,
            created_at: n.created_at || "",
            raw: n,
          });
        });
      }

      if (webhooksRes.data) {
        webhooksRes.data.forEach((w: any) => {
          tasks.push({
            id: w.id,
            type: "webhook",
            ordem: w.ordem ?? 0,
            created_at: w.created_at || "",
            raw: w,
          });
        });
      }

      if (apisRes.data) {
        apisRes.data.forEach((a: any) => {
          tasks.push({
            id: a.id,
            type: "api_connector",
            ordem: a.ordem ?? 0,
            created_at: a.created_at || "",
            raw: a,
          });
        });
      }

      const textToScan =
        JSON.stringify(tasks.map((t) => t.raw)) + JSON.stringify(payload);
      const matches = [
        ...textToScan.matchAll(/{{([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)}}/g),
      ];

      const tabelasRequisitadas = new Set<string>();
      matches.forEach((m) => tabelasRequisitadas.add(m[1]));

      const dadosTabelas: Record<string, any> = {};

      for (const tab of tabelasRequisitadas) {
        try {
          if (tab === "profiles") {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              const { data: prof } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();
              if (prof) {
                Object.entries(prof).forEach(([col, val]) => {
                  dadosTabelas[`profiles.${col}`] = val;
                });
              }
            }
          } else if (cadastroId) {
            const campoFiltro =
              tab === "cadastros" || tab === "clientes" ? "id" : "cadastro_id";
            const { data: registro } = await supabase
              .from(tab)
              .select("*")
              .eq(campoFiltro, cadastroId)
              .maybeSingle();
            if (registro) {
              Object.entries(registro).forEach(([col, val]) => {
                dadosTabelas[`${tab}.${col}`] = val;
              });
            }
          }
        } catch (errTab) {
          console.error(
            `Erro ao carregar dados dinâmicos da tabela ${tab}:`,
            errTab,
          );
        }
      }

      const payloadCompleto = {
        ...cadastroInfo,
        ...payload,
        ...usuarioInfo,
        ...dadosTabelas,
      };

      tasks.sort((a, b) => {
        if (a.ordem !== b.ordem) return a.ordem - b.ordem;
        return a.created_at.localeCompare(b.created_at);
      });

      for (const task of tasks) {
        try {
          if (task.type === "notification") {
            await dispararNotificacaoIndividual(
              task.raw as NotificacaoTemplate,
              payloadCompleto,
            );
          } else if (task.type === "webhook") {
            const wh = task.raw as Webhook;
            const body = { ...wh.body_template, ...payloadCompleto, evento };
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
              ...(wh.headers || {}),
            };

            const res = await fetch(wh.url, {
              method: wh.metodo || "POST",
              headers,
              body: JSON.stringify(body),
            });
            const text = await res.text();

            await supabase.from("logs_webhook").insert({
              webhook_id: wh.id,
              evento,
              url: wh.url,
              status_code: res.status,
              resposta: text.slice(0, 2000),
              sucesso: res.ok,
              payload_enviado: body,
            });
          } else if (task.type === "api_connector") {
            const conn = task.raw as { id: string; url: string };
            const executor = getActionExecutor("api_connector");
            const result = executor
              ? await executor(conn.id, payloadCompleto)
              : null;

            await supabase.from("logs_webhook").insert({
              webhook_id: null,
              evento,
              url: conn.url,
              status_code: result?.status || 200,
              resposta:
                typeof result?.data === "object"
                  ? JSON.stringify(result.data).slice(0, 2000)
                  : String(result?.data).slice(0, 2000),
              sucesso: result?.status >= 200 && result?.status < 300,
              payload_enviado: payloadCompleto,
            });
          }
        } catch (stepErr: any) {
          console.error(
            `Erro ao disparar passo ${task.type} (${task.id}):`,
            stepErr,
          );

          try {
            await supabase.from("logs_webhook").insert({
              webhook_id: task.type === "webhook" ? task.id : null,
              evento,
              url: task.raw?.url || "N/A",
              status_code: null,
              resposta:
                `Falha no passo ${task.type}: ` +
                (stepErr.message?.slice(0, 1900) || "Erro desconhecido"),
              sucesso: false,
              payload_enviado: payload,
            });
          } catch (logErr) {
            console.error("Falha ao registrar log de erro:", logErr);
          }
        }
      }
    } catch (err) {
      console.error("Erro crítico no orquestrador de webhooks:", err);
    }
  });
}

export async function dispararEventoModulo(
  moduloKey: string,
  eventoKey: string,
  payload: Record<string, any>,
) {
  const [webhooksRes, notifsRes, apisRes] = await Promise.all([
    supabase
      .from("webhooks")
      .select("*")
      .eq("modulo_key", moduloKey)
      .eq("evento_key", eventoKey)
      .eq("ativo", true),
    supabase
      .from("notificacoes_modelos")
      .select("*")
      .eq("modulo_key", moduloKey)
      .eq("evento_key", eventoKey)
      .eq("ativo", true),
    supabase
      .from("conectores_api")
      .select("*")
      .eq("modulo_key", moduloKey)
      .eq("evento_key", eventoKey)
      .eq("is_active", true),
  ]);

  if (webhooksRes.error) {
    console.error(
      `Erro ao buscar webhooks do módulo ${moduloKey}/${eventoKey}:`,
      webhooksRes.error,
    );
  }
  if (notifsRes.error) {
    console.error(
      `Erro ao buscar notificações do módulo ${moduloKey}/${eventoKey}:`,
      notifsRes.error,
    );
  }
  if (apisRes.error) {
    console.error(
      `Erro ao buscar conectores de API do módulo ${moduloKey}/${eventoKey}:`,
      apisRes.error,
    );
  }

  const webhooks = webhooksRes.data || [];
  const notifs = notifsRes.data || [];
  const apis = apisRes.data || [];

  if (!webhooks.length && !notifs.length && !apis.length) return;

  const body = {
    ...payload,
    evento: eventoKey,
    modulo: moduloKey,
  };

  for (const n of notifs) {
    try {
      await dispararNotificacaoIndividual(n as NotificacaoTemplate, body);
    } catch (err) {
      console.error(`Erro na notificação de módulo ${n.id}:`, err);
    }
  }

  for (const wh of webhooks) {
    try {
      const whBody = { ...wh.body_template, ...body };
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(wh.headers || {}),
      };

      const res = await fetch(wh.url, {
        method: wh.metodo || "POST",
        headers,
        body: JSON.stringify(whBody),
      });
      const text = await res.text();

      await supabase.from("logs_webhook").insert({
        webhook_id: wh.id,
        evento: eventoKey,
        url: wh.url,
        status_code: res.status,
        resposta: text.slice(0, 2000),
        sucesso: res.ok,
        payload_enviado: whBody,
      });
    } catch (err: any) {
      console.error(`Erro no webhook de módulo ${wh.id}:`, err);
      await supabase.from("logs_webhook").insert({
        webhook_id: wh.id,
        evento: eventoKey,
        url: wh.url,
        status_code: null,
        resposta: err.message?.slice(0, 1900) || "Erro desconhecido",
        sucesso: false,
        payload_enviado: payload,
      });
    }
  }

  for (const conn of apis) {
    try {
      const executor = getActionExecutor("api_connector");
      const result = executor ? await executor(conn.id, body) : null;

      await supabase.from("logs_webhook").insert({
        webhook_id: null,
        evento: eventoKey,
        url: conn.url,
        status_code: result?.status || 200,
        resposta:
          typeof result?.data === "object"
            ? JSON.stringify(result.data).slice(0, 2000)
            : String(result?.data).slice(0, 2000),
        sucesso: result?.status >= 200 && result?.status < 300,
        payload_enviado: body,
      });
    } catch (err: any) {
      console.error(`Erro no conector de API de módulo ${conn.id}:`, err);
      await supabase.from("logs_webhook").insert({
        webhook_id: null,
        evento: eventoKey,
        url: conn.url,
        status_code: null,
        resposta: err.message?.slice(0, 1900) || "Erro desconhecido",
        sucesso: false,
        payload_enviado: body,
      });
    }
  }
}

export const EVENTOS_STATUS_CHANGE = [
  { value: "link_gerado", label: "Link Gerado" },
  { value: "dados_enviados", label: "Dados Enviados" },
  { value: "em_analise", label: "Em Análise" },
  { value: "em_correcao", label: "Em Correção" },
  { value: "aprovado", label: "Aprovado" },
  { value: "reprovado", label: "Reprovado" },
];

export const EVENTOS_BUTTON_ACTION = [
  { value: "botao_compartilhar_link", label: "Compartilhar Link" },
  { value: "botao_aprovar", label: "Aprovar Cadastro" },
  { value: "botao_reprovar", label: "Reprovar Cadastro" },
  { value: "botao_corrigir", label: "Solicitar Correção" },
  { value: "criacao_credencial", label: "Criação de Credencial" },
];
