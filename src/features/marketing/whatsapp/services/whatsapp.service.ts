import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";

const MODULO_KEY = "mktg-whatsapp";

export type WhatsAppLead = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
};

export type WhatsAppCampanha = {
  id: string;
  empresa_id: string;
  nome: string;
  mensagem: string;
  total_contatos: number;
  status: string;
  created_at: string;
};

export async function carregarDadosWhatsApp(empresaId: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [leadsRes, limitRes, campanhasHojeRes, todasCampanhasRes] = await Promise.all([
    supabase.from("mktg_leads").select("id, nome, telefone, email").eq("empresa_id", empresaId),
    supabase.from("empresa_limites_modulo").select("max_envios").eq("empresa_id", empresaId).eq("modulo_key", "mktg-whatsapp").maybeSingle(),
    supabase.from("mktg_whatsapp_campanhas").select("total_contatos").eq("empresa_id", empresaId).gte("created_at", hoje.toISOString()),
    supabase.from("mktg_whatsapp_campanhas").select("*").eq("empresa_id", empresaId).order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    leads: (leadsRes.data as WhatsAppLead[]) || [],
    limiteMax: (limitRes.data as { max_envios: number } | null)?.max_envios ?? 0,
    enviadosHoje: (campanhasHojeRes.data as { total_contatos: number }[] || []).reduce((acc, c) => acc + c.total_contatos, 0),
    campanhasRecentes: (todasCampanhasRes.data as WhatsAppCampanha[]) || [],
  };
}

export async function dispararWhatsApp(input: {
  empresa_id: string;
  nome: string;
  mensagem: string;
  total_contatos: number;
}): Promise<WhatsAppCampanha> {
  const { data, error } = await supabase
    .from("mktg_whatsapp_campanhas")
    .insert({
      empresa_id: input.empresa_id,
      nome: input.nome,
      mensagem: input.mensagem,
      total_contatos: input.total_contatos,
      status: "enviado",
    })
    .select()
    .single();
  if (error) throw error;
  dispararEventoModulo(MODULO_KEY, "mensagem.enviada", { campanha_id: data.id, nome: input.nome, total_contatos: input.total_contatos, empresa_id: input.empresa_id }).catch(() => {});
  return data as WhatsAppCampanha;
}
