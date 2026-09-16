import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Rota, RotaCliente, RotaFormData, RotaStatus } from "../types";

const MODULO_KEY = "rotas";

export async function listarRotas(
  empresaId?: string | null,
  usuarioId?: string | null,
  filtros?: { status?: RotaStatus; data_inicio?: string; data_fim?: string },
): Promise<Rota[]> {
  let query = supabase
    .from("rotas")
    .select("*")
    .order("data_rota", { ascending: false });

  if (empresaId) query = query.eq("empresa_id", empresaId);
  if (usuarioId) query = query.eq("usuario_id", usuarioId);

  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.data_inicio) query = query.gte("data_rota", filtros.data_inicio);
  if (filtros?.data_fim) query = query.lte("data_rota", filtros.data_fim);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Rota[];
}

export async function buscarRota(id: string): Promise<Rota> {
  const { data, error } = await supabase
    .from("rotas")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Rota;
}

export async function buscarRotaComClientes(id: string): Promise<Rota> {
  const { data: rota, error: rotaError } = await supabase
    .from("rotas")
    .select("*")
    .eq("id", id)
    .single();
  if (rotaError) throw rotaError;

  const { data: clientes, error: clientesError } = await supabase
    .from("rotas_clientes")
    .select("*, cliente:rotas_clientes_base(*)")
    .eq("rota_id", id)
    .order("ordem");
  if (clientesError) throw clientesError;

  return { ...rota, clientes: (clientes ?? []) as RotaCliente[] } as Rota;
}

export async function criarRota(
  empresaId: string,
  usuarioId: string,
  form: RotaFormData,
): Promise<Rota> {
  const { data: rota, error: rotaError } = await supabase
    .from("rotas")
    .insert({
      empresa_id: empresaId,
      usuario_id: usuarioId,
      titulo: form.titulo,
      data_rota: form.data_rota,
      tipo: form.tipo,
      status: "planejada",
    })
    .select()
    .single();
  if (rotaError) throw rotaError;

  if (form.cliente_ids.length > 0) {
    const clientesInsert = form.cliente_ids.map((clienteId, index) => ({
      empresa_id: empresaId,
      rota_id: rota.id,
      cliente_base_id: clienteId,
      ordem: index + 1,
      status: "pendente" as const,
    }));

    const { error: clientesError } = await supabase
      .from("rotas_clientes")
      .insert(clientesInsert);
    if (clientesError) throw clientesError;
  }

  dispararEventoModulo(MODULO_KEY, "rota.criada", { rota_id: rota.id, titulo: form.titulo, empresa_id: empresaId }).catch(() => {});

  return rota as Rota;
}

export async function atualizarRota(
  id: string,
  updates: Partial<Rota>,
): Promise<Rota> {
  const { data, error } = await supabase
    .from("rotas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Rota;
}

export async function excluirRota(id: string): Promise<void> {
  const { error } = await supabase.from("rotas").delete().eq("id", id);
  if (error) throw error;
}

export async function iniciarRota(
  id: string,
  localizacao: { lat: number; lng: number },
): Promise<Rota> {
  const rota = await atualizarRota(id, {
    status: "em_execucao",
    data_inicio: new Date().toISOString(),
    local_inicio: localizacao,
  });
  dispararEventoModulo(MODULO_KEY, "rota.iniciada", { rota_id: id, empresa_id: rota.empresa_id }).catch(() => {});
  return rota;
}

export async function finalizarRota(
  id: string,
  localizacao: { lat: number; lng: number },
  stats: {
    total_visitas: number;
    total_km: number;
    total_tempo_trajeto_min: number;
    valor_reembolso: number;
  },
): Promise<Rota> {
  const rota = await atualizarRota(id, {
    status: "realizada",
    data_fim: new Date().toISOString(),
    local_fim: localizacao,
    ...stats,
  });
  dispararEventoModulo(MODULO_KEY, "rota.finalizada", { rota_id: id, total_visitas: stats.total_visitas, total_km: stats.total_km, empresa_id: rota.empresa_id }).catch(() => {});
  return rota;
}

export async function atualizarStatusClienteRota(
  rotaClienteId: string,
  status: RotaCliente["status"],
): Promise<RotaCliente> {
  const { data, error } = await supabase
    .from("rotas_clientes")
    .update({ status })
    .eq("id", rotaClienteId)
    .select()
    .single();
  if (error) throw error;

  if (status === "visitado") {
    dispararEventoModulo(MODULO_KEY, "visita.registrada", { rota_cliente_id: rotaClienteId, empresa_id: data.empresa_id }).catch(() => {});
  }

  return data as RotaCliente;
}

export async function adicionarClientesNaRota(
  rotaId: string,
  empresaId: string,
  clienteIds: string[],
): Promise<void> {
  const { data: existentes } = await supabase
    .from("rotas_clientes")
    .select("ordem")
    .eq("rota_id", rotaId)
    .order("ordem", { ascending: false })
    .limit(1);

  let proximaOrdem = (existentes?.[0]?.ordem ?? 0) + 1;

  const insert = clienteIds.map((clienteId) => ({
    empresa_id: empresaId,
    rota_id: rotaId,
    cliente_base_id: clienteId,
    ordem: proximaOrdem++,
    status: "pendente" as const,
  }));

  const { error } = await supabase.from("rotas_clientes").insert(insert);
  if (error) throw error;
}

export async function removerClienteDaRota(
  rotaClienteId: string,
): Promise<void> {
  const { error } = await supabase
    .from("rotas_clientes")
    .delete()
    .eq("id", rotaClienteId);
  if (error) throw error;
}

export async function reordenarClientes(
  rotaId: string,
  ordemIds: string[],
): Promise<void> {
  const updates = ordemIds.map((id, index) =>
    supabase
      .from("rotas_clientes")
      .update({ ordem: index + 1 })
      .eq("id", id),
  );
  await Promise.all(updates);
}
