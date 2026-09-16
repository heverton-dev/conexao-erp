import { supabase } from "~/core/supabase";

export type LinkTeste = {
  id: string;
  cadastro_id: string;
  token: string;
  descricao: string;
  created_at: string;
  cadastros?: {
    id: string;
    tipo_pessoa: "PF" | "PJ" | null;
    status: string;
    nome_temporario: string | null;
    link_expiracao: string | null;
    inicio_preenchimento: string | null;
    "2fa_canal": string | null;
    "2fa_contato": string | null;
    "2fa_token": string | null;
    "2fa_expiracao": string | null;
    status_verificacao_token: boolean | null;
    link_acessado: boolean | null;
  } | null;
};

export type DemoCredential = {
  id: string;
  user_id: string;
  email_demo: string;
  senha_demo: string;
  role_escolhida: string;
  qtd_cadastros_mock: number;
  created_at: string;
};

export async function listarLinksTestes() {
  const { data, error } = await supabase
    .from("links_testes")
    .select(
      `
      id,
      cadastro_id,
      token,
      descricao,
      created_at,
      cadastros:cadastro_id (
        id,
        tipo_pessoa,
        status,
        nome_temporario,
        link_expiracao,
        inicio_preenchimento,
        2fa_canal,
        2fa_contato,
        2fa_token,
        2fa_expiracao,
        status_verificacao_token,
        link_acessado
      )
    `,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as any[] as LinkTeste[];
}

export async function criarLinkTeste(descricao: string, tipo: "PF" | "PJ") {
  const { data: cad, error: errCad } = await supabase
    .from("cadastros")
    .insert({
      tipo_pessoa: tipo,
      status: "link_gerado",
      nome_temporario: "Cliente Teste " + tipo,
      link_expiracao: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      observacoes: "Cadastro de Teste gerado pelo Lab",
      is_demo: true,
      token_acesso: crypto.randomUUID(),
    })
    .select("id, token_acesso")
    .single();
  if (errCad) throw errCad;

  const { data, error } = await supabase
    .from("links_testes")
    .insert({
      cadastro_id: cad.id,
      token: cad.token_acesso,
      descricao,
    })
    .select()
    .single();
  if (error) throw error;
  return data as LinkTeste;
}

export async function excluirLinkTeste(id: string) {
  const { error } = await supabase.from("links_testes").delete().eq("id", id);
  if (error) throw error;
}

export async function listarDemoCredentials() {
  const { data, error } = await supabase
    .from("credenciais_demo")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DemoCredential[];
}

export async function criarDemoCredential(
  email: string,
  senha: string,
  role_escolhida: string,
  qtd_cadastros_mock: number,
) {
  const { data: uid, error: rpcError } = await supabase.rpc(
    "create_demo_user",
    {
      demo_email: email,
      demo_password: senha,
      role_esc: role_escolhida,
    },
  );
  if (rpcError) throw rpcError;

  const { data, error } = await supabase
    .from("credenciais_demo")
    .insert({
      user_id: uid,
      email_demo: email,
      senha_demo: senha,
      role_escolhida,
      qtd_cadastros_mock,
    })
    .select()
    .single();
  if (error) throw error;

  for (let i = 0; i < qtd_cadastros_mock; i++) {
    const isPf = Math.random() > 0.5;
    const s = ["dados_enviados", "em_analise", "aprovado"][
      Math.floor(Math.random() * 3)
    ];
    await supabase.from("cadastros").insert({
      created_by: uid,
      tipo_pessoa: isPf ? "PF" : "PJ",
      status: s,
      nome_temporario: `Cliente Demo ${i + 1}`,
      is_demo: true,
    });
  }

  return data as DemoCredential;
}

export async function excluirDemoCredential(id: string, user_id: string) {
  const { error } = await supabase.rpc("excluir_usuario_demo", {
    uid: user_id,
  });
  if (error) throw error;
}

export async function atualizarExpiraLink(
  cadastroId: string,
  linkExpiracao: string | null,
) {
  const { error } = await supabase
    .from("cadastros")
    .update({ link_expiracao: linkExpiracao })
    .eq("id", cadastroId);
  if (error) throw error;
}

export async function atualizarInicioPreenchimento(
  cadastroId: string,
  inicioPreenchimento: string | null,
) {
  const { error } = await supabase
    .from("cadastros")
    .update({ inicio_preenchimento: inicioPreenchimento })
    .eq("id", cadastroId);
  if (error) throw error;
}

export async function resetar2FA(cadastroId: string) {
  const { error } = await supabase
    .from("cadastros")
    .update({
      "2fa_token": null,
      "2fa_canal": null,
      "2fa_contato": null,
      "2fa_expiracao": null,
      status_verificacao_token: false,
      inicio_preenchimento: null,
      link_acessado: false,
    })
    .eq("id", cadastroId);
  if (error) throw error;
}
