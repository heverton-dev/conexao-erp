import { supabase } from "~/core/supabase";
import type { CalendarioEvento } from "../types";

export async function listarEventos(
  empresaId: string,
  dataInicio?: string,
  dataFim?: string
): Promise<CalendarioEvento[]> {
  let query = supabase
    .from("mktg_calendario")
    .select("*")
    .eq("empresa_id", empresaId);

  if (dataInicio) {
    query = query.gte("data", dataInicio);
  }
  if (dataFim) {
    query = query.lte("data", dataFim);
  }

  const { data } = await query.order("data", { ascending: true });
  return (data as CalendarioEvento[]) || [];
}

export async function criarEvento(
  evento: Omit<CalendarioEvento, "id" | "created_at" | "updated_at">
): Promise<CalendarioEvento | null> {
  const { data } = await supabase
    .from("mktg_calendario")
    .insert(evento)
    .select()
    .single();

  return data as CalendarioEvento | null;
}

export async function atualizarEvento(
  id: string,
  updates: Partial<Omit<CalendarioEvento, "id" | "created_at" | "updated_at">>
): Promise<CalendarioEvento | null> {
  const { data, error } = await supabase
    .from("mktg_calendario")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CalendarioEvento | null;
}

export async function deletarEvento(id: string): Promise<void> {
  const { error } = await supabase.from("mktg_calendario").delete().eq("id", id);
  if (error) throw error;
}
