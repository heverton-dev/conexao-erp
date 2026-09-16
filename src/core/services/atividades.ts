import { supabase } from "~/core/supabase";

export type Atividade = {
  id: string;
  entidade_tipo: "cadastro";
  entidade_id: string;
  acao: string;
  descricao: string;
  usuario_id: string | null;
  created_at: string;
  profiles?: { nome: string } | null;
};

export async function logAtividade(
  entidade_tipo: Atividade["entidade_tipo"],
  entidade_id: string,
  acao: string,
  descricao?: string,
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;

  const { error } = await supabase.from("atividades").insert({
    entidade_tipo,
    entidade_id,
    acao,
    descricao: descricao || "",
    usuario_id: user.user.id,
  });
  if (error) console.error("Erro ao logar atividade:", error);
}

export async function listarAtividades(
  entidade_tipo?: string,
  entidade_id?: string,
) {
  let query = supabase
    .from("atividades")
    .select("*, profiles!usuario_id(nome)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (entidade_tipo) query = query.eq("entidade_tipo", entidade_tipo);
  if (entidade_id) query = query.eq("entidade_id", entidade_id);

  const { data, error } = await query;
  if (error) throw error;
  return data as (Atividade & { profiles: { nome: string } | null })[];
}

export async function listarAtividadesRecentes(limit = 10) {
  const { data, error } = await supabase
    .from("atividades")
    .select("*, profiles!usuario_id(nome)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as (Atividade & { profiles: { nome: string } | null })[];
}
