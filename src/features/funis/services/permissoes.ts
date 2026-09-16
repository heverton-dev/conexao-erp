import { supabase } from "~/core/supabase";
import type { FunilPermissao, FunilPermissaoNivel } from "../types";

export async function listarPermissoesFunil(
  funilId: string,
): Promise<FunilPermissao[]> {
  const { data, error } = await supabase
    .from("funis_permissoes")
    .select("*, user:profiles!funis_permissoes_user_id_fkey(full_name, email)")
    .eq("funil_id", funilId);
  if (error) throw error;
  return (data ?? []) as unknown as FunilPermissao[];
}

export async function concederPermissao(
  funilId: string,
  userId: string,
  nivel: FunilPermissaoNivel,
): Promise<FunilPermissao> {
  const { data, error } = await supabase
    .from("funis_permissoes")
    .upsert(
      { funil_id: funilId, user_id: userId, nivel },
      { onConflict: "funil_id,user_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as FunilPermissao;
}

export async function revogarPermissao(id: string): Promise<void> {
  const { error } = await supabase
    .from("funis_permissoes")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function buscarUsuarioEmail(
  email: string,
): Promise<{ id: string; full_name: string; email: string } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .ilike("email", email)
    .limit(1)
    .single();
  if (error) return null;
  return data;
}
