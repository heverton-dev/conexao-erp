import { supabase } from "~/core/supabase";
import { type Permissoes, type ModulosAcesso } from "./types";

export async function getPermissoes(
  usuarioId: string,
  isSuperAdmin?: boolean,
): Promise<Permissoes | null> {
  if (isSuperAdmin) {
    return {
      ver_todos_cadastros: true,
      aprovar_cadastro: true,
      reprovar_cadastro: true,
      solicitar_correcao_cadastro: true,
      aprovar_documento: true,
      reprovar_documento: true,
      solicitar_correcao_documento: true,
      aprovar_campo: true,
      reprovar_campo: true,
      solicitar_correcao_campo: true,
      visualizar_documento: true,
      excluir_cadastro: true,
      gerenciar_credenciais: true,
      gerenciar_credenciais_admin: true,
      gerenciar_config: true,
      gerar_links: true,
      ver_relatorios: true,
    };
  }
  const { data } = await supabase
    .from("permissoes")
    .select("permissoes, modulos_acesso")
    .eq("usuario_id", usuarioId)
    .single();
  return data?.permissoes as Permissoes | null;
}

export async function setPermissoes(
  usuarioId: string,
  permissoes: Permissoes,
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from("permissoes").upsert(
    {
      usuario_id: usuarioId,
      permissoes: permissoes as any,
      updated_by: user.user?.id || null,
    },
    { onConflict: "usuario_id" },
  );
  if (error) throw error;
}

export async function getModulosAcesso(
  usuarioId: string,
  isSuperAdmin?: boolean,
): Promise<ModulosAcesso> {
  if (isSuperAdmin) {
    // super admin = all modules full access
    return {}; // handled by isSuperAdmin check at runtime
  }
  const { data } = await supabase
    .from("permissoes")
    .select("modulos_acesso")
    .eq("usuario_id", usuarioId)
    .single();
  return (data?.modulos_acesso as ModulosAcesso) || {};
}

export async function setModulosAcesso(
  usuarioId: string,
  modulosAcesso: ModulosAcesso,
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();

  const { error } = await supabase.from("permissoes").upsert(
    {
      usuario_id: usuarioId,
      modulos_acesso: modulosAcesso as any,
      updated_by: user.user?.id || null,
    },
    { onConflict: "usuario_id" },
  );
}

export async function listarPermissoesUsuarios(): Promise<
  {
    usuario_id: string;
    permissoes: Permissoes;
    profiles: {
      id: string;
      email: string;
      nome: string;
      ambiente: string;
      is_super_admin: boolean;
    };
  }[]
> {
  const { data, error } = await supabase
    .from("permissoes")
    .select(
      "usuario_id, permissoes, profiles!inner(id, email, nome, ambiente, is_super_admin)",
    )
    .order("profiles(nome)");
  if (error) throw error;
  return data as any;
}
