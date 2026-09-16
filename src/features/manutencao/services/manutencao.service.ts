import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Manutencao, ManutencaoInput } from "../types";

const MODULO_KEY = "manutencao";

const MENSAGEM_PADRAO =
  "Estamos em manutenção. Voltamos em breve. Agradecemos a compreensão.";

export async function listarManutencoes(): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from("modulos_manutencao")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Manutencao[]) ?? [];
}

export async function listarManutencoesAtivas(): Promise<Manutencao[]> {
  const todas = await listarManutencoes();
  const agora = Date.now();
  return todas.filter((m) => {
    if (!m.ativo) return false;
    if (m.data_fim && new Date(m.data_fim).getTime() <= agora) return false;
    return true;
  });
}

export async function salvarManutencao(
  input: ManutencaoInput,
): Promise<Manutencao> {
  const mensagem = input.mensagem?.trim() || MENSAGEM_PADRAO;

  const { data: authData } = await supabase.auth.getUser();
  const criadoPor = authData.user?.id ?? null;

  let desativarQuery = supabase
    .from("modulos_manutencao")
    .update({ ativo: false })
    .eq("modulo_key", input.modulo_key);

  if (input.rota === null) {
    desativarQuery = desativarQuery.is("rota", null);
  } else {
    desativarQuery = desativarQuery.eq("rota", input.rota);
  }

  const { error: desativaErr } = await desativarQuery;
  if (desativaErr) throw desativaErr;

  const { data, error } = await supabase
    .from("modulos_manutencao")
    .insert({
      modulo_key: input.modulo_key,
      rota: input.rota,
      ativo: true,
      mensagem,
      data_fim: input.data_fim,
      criado_por: criadoPor,
    })
    .select("*")
    .single();

  if (error) throw error;

  dispararEventoModulo(MODULO_KEY, "manutencao.ativada", {
    modulo_key: input.modulo_key,
    rota: input.rota,
    tem_fim: !!input.data_fim,
  }).catch(() => {});

  return data as Manutencao;
}

export async function desativarManutencao(id: string): Promise<void> {
  const { data: atual, error: buscaErr } = await supabase
    .from("modulos_manutencao")
    .select("*")
    .eq("id", id)
    .single();
  if (buscaErr) throw buscaErr;

  const { error } = await supabase
    .from("modulos_manutencao")
    .update({ ativo: false })
    .eq("id", id);
  if (error) throw error;

  dispararEventoModulo(MODULO_KEY, "manutencao.desativada", {
    modulo_key: (atual as Manutencao)?.modulo_key,
    rota: (atual as Manutencao)?.rota,
  }).catch(() => {});
}

export async function atualizarManutencao(
  id: string,
  input: Partial<ManutencaoInput>,
): Promise<Manutencao> {
  const { data, error } = await supabase
    .from("modulos_manutencao")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Manutencao;
}
