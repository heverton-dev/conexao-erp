import { supabase } from "~/core/supabase";

/**
 * RBAC relacional (perfis/perfis_permissoes/usuario_perfis).
 *
 * Retorna as chaves de permissão concedidas por qualquer um dos
 * perfis atribuídos ao usuário (união). Presença da chave = concessão.
 *
 * Camada aditiva: usada pelo AuthProvider para compor a permissão
 * efetiva junto com o override em `permissoes.permissoes`. Não
 * substitui a tabela `permissoes` existente.
 */
export async function buscarChavesPermissaoDosPerfis(
  userId: string,
): Promise<string[]> {
  const { data: atribuicoes } = await supabase
    .from("usuario_perfis")
    .select("perfil_id")
    .eq("usuario_id", userId);

  const perfilIds = (atribuicoes ?? []).map((a) => a.perfil_id as string);
  if (perfilIds.length === 0) return [];

  const { data: permissoesPerfis } = await supabase
    .from("perfis_permissoes")
    .select("permissao_key")
    .in("perfil_id", perfilIds);

  return (permissoesPerfis ?? []).map((p) => p.permissao_key as string);
}

export type PerfilRow = {
  id: string;
  nome: string;
  descricao: string | null;
  is_sistema: boolean;
};

export async function listarPerfis(): Promise<PerfilRow[]> {
  const { data } = await supabase
    .from("perfis")
    .select("id, nome, descricao, is_sistema")
    .order("nome");
  return (data ?? []) as PerfilRow[];
}

export async function listarPermissoesDoPerfil(
  perfilId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("perfis_permissoes")
    .select("permissao_key")
    .eq("perfil_id", perfilId);
  return (data ?? []).map((p) => p.permissao_key as string);
}

export async function listarPerfisDoUsuario(
  usuarioId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("usuario_perfis")
    .select("perfil_id")
    .eq("usuario_id", usuarioId);
  return (data ?? []).map((p) => p.perfil_id as string);
}

export async function atribuirPerfil(
  usuarioId: string,
  perfilId: string,
  createdBy?: string,
): Promise<void> {
  const { error } = await supabase
    .from("usuario_perfis")
    .insert({ usuario_id: usuarioId, perfil_id: perfilId, created_by: createdBy });
  if (error) throw error;
}

export async function removerPerfil(
  usuarioId: string,
  perfilId: string,
): Promise<void> {
  const { error } = await supabase
    .from("usuario_perfis")
    .delete()
    .eq("usuario_id", usuarioId)
    .eq("perfil_id", perfilId);
  if (error) throw error;
}
