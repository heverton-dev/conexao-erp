import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { NpsWebhookConfig } from "../types";

const MODULO_KEY = "nps";

export async function listarWebhooks(
  empresaId: string,
): Promise<NpsWebhookConfig[]> {
  const { data, error } = await supabase
    .from("nps_webhook_config")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as NpsWebhookConfig[]) || [];
}

export async function salvarWebhook(
  empresaId: string,
  url: string,
  active: boolean,
  existingId?: string,
): Promise<NpsWebhookConfig> {
  if (existingId) {
    const { data, error } = await supabase
      .from("nps_webhook_config")
      .update({ url, active })
      .eq("id", existingId)
      .select()
      .single();

    if (error) throw error;
    return data as NpsWebhookConfig;
  }

  const { data, error } = await supabase
    .from("nps_webhook_config")
    .insert({ empresa_id: empresaId, url, active })
    .select()
    .single();

  if (error) throw error;
  return data as NpsWebhookConfig;
}

export async function excluirWebhook(id: string): Promise<void> {
  const { error } = await supabase
    .from("nps_webhook_config")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function dispararWebhook(
  url: string,
  payload: Record<string, any>,
): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        created_at: new Date().toISOString(),
      }),
      mode: "no-cors",
    });
  } catch (err) {
    console.warn("Webhook não enviado:", err);
  }
}

const SAMPLE_PAYLOAD = {
  nps_score: 9,
  nps_comment: "Excelente atendimento!",
  csat: "Muito satisfeito",
  atendimento_comercial: "Excelente",
  entendimento_consultor: "Sim totalmente",
  melhoria_atendimento: "",
  experiencia_compra: "Muito fácil",
  matrix_facilidade_pedido: 5,
  matrix_clareza_condicoes: 4,
  matrix_prazo_entrega: 5,
  matrix_disponibilidade_produtos: 4,
  matrix_comunicacao: 5,
  expansao_produtos: "",
  oportunidade: "",
  pergunta_final: "",
  order_id: "ORD-001",
  client_id: "CLI-001",
  client_name: "Maria Silva",
  vendor_name: "João Santos",
  source: "whatsapp",
  created_at: new Date().toISOString(),
};

export async function testarWebhook(url: string): Promise<void> {
  await dispararWebhook(url, SAMPLE_PAYLOAD);
}
