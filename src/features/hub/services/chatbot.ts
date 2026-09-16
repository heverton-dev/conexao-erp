import { supabase } from "~/core/supabase/client";
import type { HubChatbotConfig } from "../types";

export async function fetchHubChatbotConfig() {
  const { data, error } = await supabase
    .from("hub_config_chatbot")
    .select("*")
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data as HubChatbotConfig | null;
}

export async function upsertHubChatbotConfig(
  config: Partial<HubChatbotConfig>,
) {
  const { data, error } = await supabase
    .from("hub_config_chatbot")
    .upsert(config, { onConflict: "empresa_id" })
    .select()
    .single();
  if (error) throw error;
  return data as HubChatbotConfig;
}

export async function sendHubChatMessage(message: string, empresaId: string) {
  const config = await fetchHubChatbotConfig();
  if (!config || !config.enabled || !config.webhook_url) {
    return { reply: "Chatbot não configurado nesta empresa." };
  }
  try {
    const response = await fetch(config.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, empresa_id: empresaId }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json();
    return { reply: data.reply || data.message || "Sem resposta do chatbot." };
  } catch {
    return { reply: "Erro ao conectar com o chatbot. Tente novamente." };
  }
}
