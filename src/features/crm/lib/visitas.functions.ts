import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuthMiddleware } from "~/integrations/supabase/auth-middleware";
import { dispararEventoModulo } from "~/core/services/webhooks";
import { z } from "zod";

const MODULO_KEY = "crm";

const N8N_WEBHOOK_URL =
  "https://flow-webhook.vpsconexao.org/webhook/form_visita";

const visitaSchema = z.object({
  cliente_id: z.string().uuid(),
  data_visita: z.string(),
  atendente: z.string().min(1).max(255),
  cargo_atendente: z.enum(["Secretária", "Dentista", "Outro"]),
  tipo_visita: z.enum(["Prospecção", "Relacionamento", "Pós-venda"]),
  gerou_orcamento: z.boolean(),
  gerou_pedido: z.boolean(),
  valor_estimado: z.number().nullable().optional(),
  interesse_escala: z.number().int().min(1).max(5),
  temperatura_vendedor: z.enum(["Frio", "Morno", "Quente"]),
  probabilidade_fechamento: z
    .enum(["Baixa", "Média", "Alta"])
    .nullable()
    .optional(),
  feedback_cliente: z.string().max(2000).optional().nullable(),
  observacoes_vendedor: z.string().max(2000).optional().nullable(),
  data_proximo_contato: z.string().nullable().optional(),
  acao_prevista: z.string().max(255).optional().nullable(),
});

export const registrarVisita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuthMiddleware])
  .inputValidator((input: unknown) => visitaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const insertPayload = { ...data, consultor_executor_id: userId };

    const { data: visita, error } = await supabase
      .from("visitas")
      .insert(insertPayload)
      .select("*, clientes(id, nome_doutor)")
      .single();

    if (error) throw new Error(error.message);

    // Buscar dados do consultor para o webhook
    const { data: consultor } = await supabase
      .from("usuarios")
      .select("id, nome_completo")
      .eq("id", userId)
      .single();

    const payload = {
      evento: "registro_visita",
      timestamp: new Date().toISOString(),
      consultor: {
        id: consultor?.id ?? userId,
        nome: consultor?.nome_completo ?? "",
      },
      cliente: {
        id: visita.cliente_id,
        nome: (visita as any).clientes?.nome_doutor ?? "",
        atendente: data.atendente,
      },
      negociacao: {
        tipo_visita: data.tipo_visita,
        orcamento_gerado: data.gerou_orcamento,
        pedido_fechado: data.gerou_pedido,
        valor_estimado: data.valor_estimado ?? 0,
        escala_interesse: data.interesse_escala,
        temperatura: data.temperatura_vendedor,
        probabilidade: data.probabilidade_fechamento ?? null,
      },
      textos_livres: {
        feedback_cliente: data.feedback_cliente ?? "",
        observacoes_vendedor: data.observacoes_vendedor ?? "",
      },
      follow_up: {
        data_proximo_contato: data.data_proximo_contato ?? null,
        acao_prevista: data.acao_prevista ?? "",
      },
    };

    let webhookStatus: { ok: boolean; mensagem?: string } = { ok: false };
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        webhookStatus = { ok: true, mensagem: json?.mensagem };
      } else {
        webhookStatus = {
          ok: false,
          mensagem: `Webhook retornou ${res.status}`,
        };
      }
    } catch (err) {
      webhookStatus = { ok: false, mensagem: (err as Error).message };
    }

    dispararEventoModulo(MODULO_KEY, "visita.realizada", { visita_id: visita.id, cliente_id: data.cliente_id, consultor_id: userId, tipo: data.tipo_visita }).catch(() => {});
    return { visita, webhook: webhookStatus };
  });

const clienteSchema = z.object({
  nome_doutor: z.string().min(1).max(255),
  nome_clinica: z.string().max(255).optional().nullable(),
  telefone_contato: z.string().max(20).optional().nullable(),
});

export const criarCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuthMiddleware])
  .inputValidator((input: unknown) => clienteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cliente, error } = await supabase
      .from("clientes")
      .insert({ ...data, consultor_atual_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    dispararEventoModulo(MODULO_KEY, "cliente.criado", { cliente_id: cliente.id, nome: data.nome_doutor, consultor_id: userId }).catch(() => {});
    return cliente;
  });
