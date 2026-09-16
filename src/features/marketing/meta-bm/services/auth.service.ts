import { supabase } from "~/core/supabase";

export async function conectarMeta(
  empresaId: string,
  code: string,
): Promise<boolean> {
  const { error } = await supabase.from("mktg_meta_contas").insert({
    empresa_id: empresaId,
    meta_user_id: code,
    access_token: code,
    status: "conectado",
    token_expires_at: new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  });
  return !error;
}

export async function desconectar(empresaId: string): Promise<boolean> {
  const { error } = await supabase
    .from("mktg_meta_contas")
    .update({ status: "desconectado", access_token: null })
    .eq("empresa_id", empresaId);

  return !error;
}

export async function verificarConexao(empresaId: string) {
  const { data } = await supabase
    .from("mktg_meta_contas")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("status", "conectado")
    .maybeSingle();

  return data;
}

export async function obterConta(empresaId: string) {
  const { data } = await supabase
    .from("mktg_meta_contas")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle();

  return data;
}
