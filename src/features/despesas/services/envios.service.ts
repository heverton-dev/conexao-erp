import { supabase } from "~/core/supabase";
import type { DespesaEnvio, EnvioFiltros } from "../types";

export async function listarEnviosEmpresa(
  filtros?: EnvioFiltros,
): Promise<DespesaEnvio[]> {
  let query = supabase
    .from("despesas_envios")
    .select(
      "*, periodo:despesas_periodos(*), usuario:profiles!usuario_id(nome, email), aprovador:profiles!aprovador_id(nome, email)",
    )
    .order("created_at", { ascending: false });

  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.periodo_id) query = query.eq("periodo_id", filtros.periodo_id);
  if (filtros?.usuario_id) query = query.eq("usuario_id", filtros.usuario_id);

  const { data, error } = await query;
  if (error) throw error;
  return data as DespesaEnvio[];
}

export async function listarEnviosPendentes(
): Promise<DespesaEnvio[]> {
  return listarEnviosEmpresa({ status: "pendente" });
}

export async function listarMeusEnvios(
  usuario_id: string,
): Promise<DespesaEnvio[]> {
  return listarEnviosEmpresa({ usuario_id });
}

export async function buscarEnvio(id: string): Promise<DespesaEnvio> {
  const { data, error } = await supabase
    .from("despesas_envios")
    .select(
      "*, periodo:despesas_periodos(*), usuario:profiles!usuario_id(nome, email), aprovador:profiles!aprovador_id(nome, email)",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as DespesaEnvio;
}

export async function buscarEnvioPorPeriodo(
  usuario_id: string,
  periodo_id: string,
): Promise<DespesaEnvio | null> {
  const { data, error } = await supabase
    .from("despesas_envios")
    .select("*, periodo:despesas_periodos(*)")
    .eq("usuario_id", usuario_id)
    .eq("periodo_id", periodo_id)
    .maybeSingle();
  if (error) throw error;
  return data as DespesaEnvio | null;
}

export async function criarOuAtualizarEnvio(
  usuario_id: string,
  periodo_id: string,
): Promise<DespesaEnvio> {
  let envio = await buscarEnvioPorPeriodo(usuario_id, periodo_id);

  if (!envio) {
    const { data, error } = await supabase
      .from("despesas_envios")
      .insert({
        usuario_id,
        periodo_id,
        total_despesas: 0,
        valor_total: 0,
        status: "pendente",
      })
      .select("*, periodo:despesas_periodos(*)")
      .single();
    if (error) throw error;
    envio = data as DespesaEnvio;
  }

  return envio;
}

export async function aprovarEnvio(
  id: string,
  aprovador_id: string,
): Promise<DespesaEnvio> {
  const { data, error } = await supabase
    .from("despesas_envios")
    .update({
      status: "aprovado",
      aprovador_id,
      data_aprovacao: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, periodo:despesas_periodos(*)")
    .single();
  if (error) throw error;

  await supabase
    .from("despesas")
    .update({ status: "aprovada" })
    .eq("periodo_id", data.periodo_id)
    .eq("usuario_id", data.usuario_id)
    .eq("status", "pendente");

  return data as DespesaEnvio;
}

export async function reprovarEnvio(
  id: string,
  aprovador_id: string,
  comentario: string,
): Promise<DespesaEnvio> {
  const { data, error } = await supabase
    .from("despesas_envios")
    .update({
      status: "reprovado",
      aprovador_id,
      data_aprovacao: new Date().toISOString(),
      comentario,
    })
    .eq("id", id)
    .select("*, periodo:despesas_periodos(*)")
    .single();
  if (error) throw error;

  await supabase
    .from("despesas")
    .update({ status: "reprovada", comentario_reprovacao: comentario })
    .eq("periodo_id", data.periodo_id)
    .eq("usuario_id", data.usuario_id)
    .eq("status", "pendente");

  return data as DespesaEnvio;
}

export async function aprovarEnvioParcial(
  id: string,
  aprovador_id: string,
  despesasAprovadas: string[],
  despesasReprovadas: string[],
  comentario: string,
): Promise<DespesaEnvio> {
  if (despesasAprovadas.length > 0) {
    await supabase
      .from("despesas")
      .update({ status: "aprovada" })
      .in("id", despesasAprovadas);
  }

  if (despesasReprovadas.length > 0) {
    await supabase
      .from("despesas")
      .update({ status: "reprovada", comentario_reprovacao: comentario })
      .in("id", despesasReprovadas);
  }

  const { data, error } = await supabase
    .from("despesas_envios")
    .update({
      status: "parcial",
      aprovador_id,
      data_aprovacao: new Date().toISOString(),
      comentario,
    })
    .eq("id", id)
    .select("*, periodo:despesas_periodos(*)")
    .single();
  if (error) throw error;

  return data as DespesaEnvio;
}
