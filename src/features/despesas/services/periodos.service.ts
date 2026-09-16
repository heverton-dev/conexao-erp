import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { DespesaPeriodo, Frequencia } from "../types";

const MODULO_KEY = "despesas";

export async function listarPeriodos(
): Promise<DespesaPeriodo[]> {
  const { data, error } = await supabase
    .from("despesas_periodos")
    .select("*")
    .order("data_inicio", { ascending: false });
  if (error) throw error;
  return data as DespesaPeriodo[];
}

export async function listarPeriodosAbertos(
): Promise<DespesaPeriodo[]> {
  const { data, error } = await supabase
    .from("despesas_periodos")
    .select("*")
    .eq("status", "aberto")
    .order("data_inicio", { ascending: false });
  if (error) throw error;
  return data as DespesaPeriodo[];
}

export async function buscarPeriodo(id: string): Promise<DespesaPeriodo> {
  const { data, error } = await supabase
    .from("despesas_periodos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as DespesaPeriodo;
}

export async function buscarPeriodoAtual(
): Promise<DespesaPeriodo | null> {
  const hoje = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("despesas_periodos")
    .select("*")
    .eq("status", "aberto")
    .lte("data_inicio", hoje)
    .gte("data_fim", hoje)
    .maybeSingle();
  if (error) throw error;
  return data as DespesaPeriodo | null;
}

export async function criarPeriodo(
  periodo: Partial<DespesaPeriodo>,
): Promise<DespesaPeriodo> {
  const { data, error } = await supabase
    .from("despesas_periodos")
    .insert(periodo)
    .select()
    .single();
  if (error) throw error;

  dispararEventoModulo(MODULO_KEY, "periodo.aberto", { periodo_id: data.id }).catch(() => {});

  return data as DespesaPeriodo;
}

export async function atualizarPeriodo(
  id: string,
  updates: Partial<DespesaPeriodo>,
): Promise<DespesaPeriodo> {
  const { data, error } = await supabase
    .from("despesas_periodos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DespesaPeriodo;
}

export async function fecharPeriodo(id: string): Promise<DespesaPeriodo> {
  const periodo = await atualizarPeriodo(id, { status: "fechado" });
  dispararEventoModulo(MODULO_KEY, "periodo.fechando", { periodo_id: id }).catch(() => {});
  return periodo;
}

export async function reabrirPeriodo(id: string): Promise<DespesaPeriodo> {
  const periodo = await atualizarPeriodo(id, { status: "aberto" });
  dispararEventoModulo(MODULO_KEY, "periodo.reaberto", { periodo_id: id }).catch(() => {});
  return periodo;
}

export async function excluirPeriodo(
  id: string,
): Promise<void> {
  const { count } = await supabase
    .from("despesas")
    .select("id", { count: "exact", head: true })
    .eq("periodo_id", id);
  if (count && count > 0) {
    throw new Error("Não é possível excluir o período: existem despesas vinculadas a ele.");
  }
  const { error } = await supabase
    .from("despesas_periodos")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatarData(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function gerarPeriodos(
  frequencia: Frequencia,
  meses: string[],
): Promise<void> {
  const periodos: Partial<DespesaPeriodo>[] = [];

  for (const mesAno of meses) {
    const [ano, mes] = mesAno.split("-").map(Number);
    const mesIndex = mes - 1;

    if (frequencia === "mensal") {
      const ultimoDia = getLastDayOfMonth(ano, mesIndex);
      periodos.push({
        data_inicio: formatarData(ano, mesIndex, 1),
        data_fim: formatarData(ano, mesIndex, ultimoDia),
        status: "aberto",
      });
    } else if (frequencia === "quinzenal") {
      periodos.push({
        data_inicio: formatarData(ano, mesIndex, 1),
        data_fim: formatarData(ano, mesIndex, 15),
        status: "aberto",
      });
      const ultimoDia = getLastDayOfMonth(ano, mesIndex);
      periodos.push({
        data_inicio: formatarData(ano, mesIndex, 16),
        data_fim: formatarData(ano, mesIndex, ultimoDia),
        status: "aberto",
      });
    } else if (frequencia === "semanal") {
      const primeiroDia = new Date(ano, mesIndex, 1);
      let inicio = new Date(primeiroDia);
      while (inicio.getMonth() === mesIndex) {
        const fim = new Date(inicio);
        fim.setDate(fim.getDate() + 6);
        if (fim.getMonth() !== mesIndex) {
          fim.setDate(getLastDayOfMonth(ano, mesIndex));
        }
        periodos.push({
          data_inicio: inicio.toISOString().split("T")[0],
          data_fim: fim.toISOString().split("T")[0],
          status: "aberto",
        });
        inicio = new Date(fim);
        inicio.setDate(inicio.getDate() + 1);
      }
    }
  }

  if (periodos.length > 0) {
    const { error } = await supabase
      .from("despesas_periodos")
      .upsert(periodos, {
        onConflict: "data_inicio,data_fim",
        ignoreDuplicates: true,
      });
    if (error) throw error;
  }
}
