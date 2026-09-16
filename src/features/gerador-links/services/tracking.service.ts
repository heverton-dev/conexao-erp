import { supabase } from "~/core/supabase";
import { parseUA } from "../utils/userAgent";
import type { LinkClique, TipoLink } from "../types";
import { dispararEventoModulo } from "~/core/services/webhooks";

const MODULO_KEY = "gerador-links";

export async function registrarClique(linkId: string) {
  const ua = navigator.userAgent;
  const ref = document.referrer || null;
  const { data, error } = await supabase.rpc("registrar_clique", {
    p_link_id: linkId,
    p_user_agent: ua,
    p_ip: null,
    p_ref: ref,
  });
  if (error) throw error;
  dispararEventoModulo(MODULO_KEY, "link.clicado", { link_id: linkId }).catch(() => {});
  return data as { redirect_url: string; tipo_link: string }[];
}

export async function getCliquesPorLink(linkId: string): Promise<LinkClique[]> {
  const { data } = await supabase
    .from("gerador_link_cliques")
    .select("*")
    .eq("link_id", linkId)
    .order("clique_em", { ascending: false });
  return (data as LinkClique[]) || [];
}

type DispositivoStats = {
  dispositivo: { mobile: number; desktop: number; tablet: number; unknown: number };
  navegador: Record<string, number>;
  sistema: Record<string, number>;
  referrer: { dominio: string; total: number }[];
};

function extrairDominio(ref: string | null): string {
  if (!ref) return "direto";
  try {
    const url = new URL(ref);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}
export async function getDashboardStats(
  dataInicio?: string,
  dataFim?: string,
) {
  let queryLinks = supabase
    .from("gerador_links")
    .select("id, titulo, tipo, created_at")

  if (dataInicio) queryLinks = queryLinks.gte("created_at", dataInicio);
  if (dataFim) queryLinks = queryLinks.lte("created_at", dataFim);

  const { data: links } = await queryLinks;
  const total_links = links?.length ?? 0;

  const ids = (links ?? []).map((l) => l.id);
  if (ids.length === 0) {
    return {
      total_links: 0,
      total_cliques: 0,
      links_por_tipo: [],
      cliques_por_dia: [],
      top_links: [],
      dispositivos: { mobile: 0, desktop: 0, tablet: 0, unknown: 0 },
      navegadores: {},
      sistemas: {},
      referrer_groups: [],
    };
  }

  let queryCliques = supabase
    .from("gerador_link_cliques")
    .select("link_id, clique_em, user_agent, ref")
    .in("link_id", ids);

  if (dataInicio) queryCliques = queryCliques.gte("clique_em", dataInicio);
  if (dataFim) queryCliques = queryCliques.lte("clique_em", dataFim);

  const { data: cliques } = await queryCliques;
  const total_cliques = cliques?.length ?? 0;

  const contagemTipo: Record<string, number> = {};
  const contagemLink: Record<string, number> = {};
  const cliquesPorDia: Record<string, number> = {};
  const referrerMap: Record<string, number> = {};
  const dispositivo: DispositivoStats["dispositivo"] = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
  const navegador: Record<string, number> = {};
  const sistema: Record<string, number> = {};

  for (const l of links ?? []) {
    contagemTipo[l.tipo] = (contagemTipo[l.tipo] ?? 0) + 0;
  }

  for (const c of cliques ?? []) {
    contagemLink[c.link_id] = (contagemLink[c.link_id] ?? 0) + 1;
    const dia = c.clique_em?.slice(0, 10);
    if (dia) cliquesPorDia[dia] = (cliquesPorDia[dia] ?? 0) + 1;

    const dom = extrairDominio(c.ref);
    referrerMap[dom] = (referrerMap[dom] ?? 0) + 1;

    if (c.user_agent) {
      const ua = parseUA(c.user_agent);
      dispositivo[ua.device] = (dispositivo[ua.device] ?? 0) + 1;
      navegador[ua.browser] = (navegador[ua.browser] ?? 0) + 1;
      sistema[ua.os] = (sistema[ua.os] ?? 0) + 1;
    }
  }

  for (const l of links ?? []) {
    const count = contagemLink[l.id] ?? 0;
    contagemTipo[l.tipo] = (contagemTipo[l.tipo] ?? 0) + count;
  }

  const links_por_tipo = Object.entries(contagemTipo).map(([tipo, total]) => ({
    tipo: tipo as TipoLink,
    total,
  }));

  const cliques_por_dia = Object.entries(cliquesPorDia)
    .map(([dia, total]) => ({ dia, total }))
    .sort((a, b) => a.dia.localeCompare(b.dia));

  const top_links = (links ?? [])
    .map((l) => ({
      id: l.id,
      titulo: l.titulo,
      tipo: l.tipo as TipoLink,
      total_cliques: contagemLink[l.id] ?? 0,
    }))
    .sort((a, b) => b.total_cliques - a.total_cliques)
    .slice(0, 10);

  const referrer_groups = Object.entries(referrerMap)
    .map(([dominio, total]) => ({ dominio, total }))
    .sort((a, b) => b.total - a.total);

  return {
    total_links,
    total_cliques,
    links_por_tipo,
    cliques_por_dia,
    top_links,
    dispositivos: dispositivo,
    navegadores: navegador,
    sistemas: sistema,
    referrer_groups,
  };
}

export async function getCliquesCSV(linkId: string) {
  const cliques = await getCliquesPorLink(linkId);
  return cliques.map((c) => ({
    data: c.clique_em?.slice(0, 19).replace("T", " ") ?? "",
    user_agent: c.user_agent ?? "",
    ref: c.ref ?? "",
    ip: c.ip ?? "",
  }));
}
