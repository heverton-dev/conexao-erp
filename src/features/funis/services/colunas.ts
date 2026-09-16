import { supabase } from "~/core/supabase";
import type { FunilColuna, FunilColunaInput } from "../types";

export async function listarColunas(funilId: string): Promise<FunilColuna[]> {
  const { data, error } = await supabase
    .from("funis_colunas")
    .select("*")
    .eq("funil_id", funilId)
    .order("posicao");
  if (error) throw error;
  return (data ?? []) as FunilColuna[];
}

export async function criarColuna(
  input: FunilColunaInput,
): Promise<FunilColuna> {
  const { data, error } = await supabase
    .from("funis_colunas")
    .insert({
      funil_id: input.funil_id,
      titulo: input.titulo,
      posicao: input.posicao ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FunilColuna;
}

export async function atualizarColuna(
  id: string,
  input: { titulo?: string; posicao?: number },
): Promise<FunilColuna> {
  const { data, error } = await supabase
    .from("funis_colunas")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as FunilColuna;
}

export async function reordenarColunas(
  colunas: { id: string; posicao: number }[],
): Promise<void> {
  const updates = colunas.map((c) =>
    supabase
      .from("funis_colunas")
      .update({ posicao: c.posicao })
      .eq("id", c.id),
  );
  const results = await Promise.all(updates);
  const err = results.find((r) => r.error);
  if (err) throw err.error;
}

export async function deletarColuna(id: string): Promise<void> {
  const { error } = await supabase.from("funis_colunas").delete().eq("id", id);
  if (error) throw error;
}
