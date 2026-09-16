import { supabase } from "~/core/supabase";

export type MktgEventoTipo =
  | "visualizacao"
  | "clique"
  | "scroll"
  | "conversao"
  | "form_submit"
  | "permanencia";

export type MktgEvento = {
  empresa_id: string;
  modulo: string;
  tipo: MktgEventoTipo;
  metadata?: Record<string, unknown>;
  page_url?: string;
  user_id?: string;
  session_id?: string;
};

export async function trackEvento(evento: MktgEvento): Promise<void> {
  await supabase.from("mktg_eventos").insert({
    empresa_id: evento.empresa_id,
    modulo: evento.modulo,
    tipo: evento.tipo,
    metadata: evento.metadata || {},
    page_url: evento.page_url || null,
    user_id: evento.user_id || null,
    session_id: evento.session_id || null,
  });
}

export function useLandingPageTracking(
  landingPageId: string,
  empresaId: string,
) {
  const track = (tipo: MktgEventoTipo, metadata?: Record<string, unknown>) => {
    trackEvento({
      empresa_id: empresaId,
      modulo: "landing-pages",
      tipo,
      metadata: { ...metadata, landing_page_id: landingPageId },
    });
  };
  return { track };
}
