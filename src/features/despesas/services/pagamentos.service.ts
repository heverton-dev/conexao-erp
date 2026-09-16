import { supabase } from "~/core/supabase";
import type { DespesaPagamento, FormaPagamento } from "../types";

export async function listarPagamentos(
): Promise<DespesaPagamento[]> {
  const { data, error } = await supabase
    .from("despesas_pagamentos")
    .select(
      "*, envio:despesas_envios(*, periodo:despesas_periodos(*), usuario:profiles!usuario_id(nome, email))",
    )
    .order("data_pagamento", { ascending: false });
  if (error) throw error;
  return data as DespesaPagamento[];
}

export async function listarPagamentosPorEnvio(
  envio_id: string,
): Promise<DespesaPagamento[]> {
  const { data, error } = await supabase
    .from("despesas_pagamentos")
    .select("*")
    .eq("envio_id", envio_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DespesaPagamento[];
}

export async function buscarPagamento(id: string): Promise<DespesaPagamento> {
  const { data, error } = await supabase
    .from("despesas_pagamentos")
    .select(
      "*, envio:despesas_envios(*, periodo:despesas_periodos(*), usuario:profiles!usuario_id(nome, email))",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as DespesaPagamento;
}

export async function criarPagamento(pagamento: {
  envio_id: string;
  valor: number;
  forma_pagamento: FormaPagamento;
  data_pagamento: string;
}): Promise<DespesaPagamento> {
  const { data, error } = await supabase
    .from("despesas_pagamentos")
    .insert({ ...pagamento, status: "pendente" })
    .select()
    .single();
  if (error) throw error;
  return data as DespesaPagamento;
}

export async function atualizarPagamento(
  id: string,
  updates: Partial<DespesaPagamento>,
): Promise<DespesaPagamento> {
  const { data, error } = await supabase
    .from("despesas_pagamentos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DespesaPagamento;
}

export async function marcarComoPago(
  id: string,
  comprovante?: string,
): Promise<DespesaPagamento> {
  const updates: Partial<DespesaPagamento> = { status: "pago" };
  if (comprovante) updates.comprovante_pagamento = comprovante;
  return atualizarPagamento(id, updates);
}

export async function cancelarPagamento(id: string): Promise<DespesaPagamento> {
  return atualizarPagamento(id, { status: "cancelado" });
}
