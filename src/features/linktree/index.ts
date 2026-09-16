import * as QRCode from "qrcode";
import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";

const MODULO_KEY = "linktree";

import type {
  LinktreeColaborador,
  LinktreeColaboradorComCredencial,
  LinktreeColaboradorInput,
  LinktreeThemeConfig,
} from "./types";
import { normalizeLinktreeTheme } from "./types";

export async function listarColaboradores(empresaId?: string) {
  let query = supabase
    .from("linktree_colaboradores")
    .select(
      "*, credenciais(id, nome_completo, email_corporativo, whatsapp_corporativo, departamento)",
    )
    .order("created_at", { ascending: false });
  if (empresaId) query = query.eq("empresa_id", empresaId);
  const { data, error } = await query;
  if (error) throw error;
  return data as LinktreeColaboradorComCredencial[];
}

export async function criarColaborador(input: LinktreeColaboradorInput) {
  const { data, error } = await supabase
    .from("linktree_colaboradores")
    .insert(input)
    .select(
      "*, credenciais(id, nome_completo, email_corporativo, whatsapp_corporativo, departamento)",
    )
    .single();
  if (error) throw error;
  return data as LinktreeColaboradorComCredencial;
}

export async function atualizarColaborador(
  id: string,
  input: Partial<LinktreeColaboradorInput>,
) {
  const { data, error } = await supabase
    .from("linktree_colaboradores")
    .update(input)
    .eq("id", id)
    .select(
      "*, credenciais(id, nome_completo, email_corporativo, whatsapp_corporativo, departamento)",
    )
    .single();
  if (error) throw error;
  dispararEventoModulo(MODULO_KEY, "colaborador.criado", { colaborador_id: data.id, nome: data.nome, empresa_id: data.empresa_id }).catch(() => {});
  return data as LinktreeColaboradorComCredencial;
}

export async function toggleColaboradorStatus(
  id: string,
  status: "ativo" | "inativo",
) {
  const { data, error } = await supabase
    .from("linktree_colaboradores")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  const evento = status === "ativo" ? "colaborador.ativado" : "colaborador.inativado";
  dispararEventoModulo(MODULO_KEY, evento, { colaborador_id: id, nome: data.nome, status, empresa_id: data.empresa_id }).catch(() => {});
  return data as LinktreeColaborador;
}

export async function deletarColaborador(id: string) {
  const { error } = await supabase
    .from("linktree_colaboradores")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function buscarColaboradorPorId(id: string) {
  const { data, error } = await supabase
    .from("linktree_colaboradores")
    .select(
      "*, credenciais(id, nome_completo, email_corporativo, whatsapp_corporativo, departamento)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as LinktreeColaboradorComCredencial | null;
}

export async function buscarTemaConfig(empresaId?: string) {
  const id = empresaId || "global";
  const { data, error } = await supabase
    .from("linktree_tema_config")
    .select("config")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return normalizeLinktreeTheme(data?.config);
}

export async function salvarTemaConfig(
  empresaId: string | null,
  config: LinktreeThemeConfig,
) {
  const id = empresaId || "global";
  const { error } = await supabase
    .from("linktree_tema_config")
    .upsert(
      { id, empresa_id: empresaId, config: config as any },
      { onConflict: "id" },
    );
  if (error) throw error;
}

export function buildCardUrl(id: string): string {
  if (typeof window === "undefined") return `/linktree/${id}`;
  return `${window.location.origin}/linktree/${id}`;
}

export async function gerarQrCodeDataUrl(id: string): Promise<string> {
  const svgStr = await QRCode.toString(buildCardUrl(id), {
    type: "svg",
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
    errorCorrectionLevel: "H",
    width: 512,
  });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
}

export async function downloadQrPng(id: string, name: string) {
  const dataUrl = await gerarQrCodeDataUrl(id);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `qrcode-${slug(name)}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
