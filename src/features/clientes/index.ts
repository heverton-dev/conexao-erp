import { supabase } from "~/core/supabase";

export type CadastroStatus =
  | "link_gerado"
  | "dados_enviados"
  | "em_analise"
  | "em_correcao"
  | "aprovado"
  | "reprovado";

export type TipoEndereco = "empresa" | "entrega" | "cobranca";

export type Endereco = {
  id: string;
  cadastro_id: string;
  tipo_endereco: TipoEndereco;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  estado: string;
  endereco_completo: string | null;
};

export type Cadastro = {
  id: string;
  codigo_cliente: string | null;
  tipo_pessoa: "PF" | "PJ" | null;
  status: CadastroStatus;
  token_acesso: string | null;
  nome_temporario: string | null;
  tipo_acao: "solicitar_cadastro" | "atualizar_cadastro" | null;
  forma_compartilhamento: "whatsapp" | "email" | "copiar" | null;
  link_expiracao: string | null;
  data_criacao_link: string | null;
  data_finalizacao: string | null;
  comentario_reprovacao: string | null;
  revisado: boolean;
  colaborador: string | null;
  observacoes: string;
  lead_nome: string | null;
  lead_email: string | null;
  lead_whatsapp: string | null;
  data_consulta: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { nome: string } | null;
  campos_correcao?: string[] | null;
};

export type CadastroInput = {
  tipo_acao?: "solicitar_cadastro" | "atualizar_cadastro";
  forma_compartilhamento?: "whatsapp" | "email" | "copiar";
  nome_temporario?: string | null;
  lead_nome?: string | null;
  lead_email?: string | null;
  lead_whatsapp?: string | null;
  link_expiracao?: string | null;
};

export async function listarCadastros(filters?: {
  status?: CadastroStatus;
  tipo_acao?: CadastroInput["tipo_acao"];
  created_by?: string;
  search?: string;
}) {
  try {
    await supabase.rpc("limpar_links_expirados");
  } catch (err) {
    console.error("Erro ao limpar links expirados:", err);
  }

  let query = supabase
    .from("cadastros")
    .select("*, profiles!created_by(nome)")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.tipo_acao) query = query.eq("tipo_acao", filters.tipo_acao);
  if (filters?.created_by) query = query.eq("created_by", filters.created_by);
  if (filters?.search) {
    query = query.or(
      `nome_temporario.ilike.%${filters.search}%,lead_nome.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as (Cadastro & { profiles: { nome: string } | null })[];
}

export async function buscarCadastro(id: string) {
  const { data, error } = await supabase
    .from("cadastros")
    .select("*, profiles!created_by(nome)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Cadastro & { profiles: { nome: string } | null };
}

export async function buscarCadastroCompleto(id: string) {
  try {
    await supabase.rpc("limpar_links_expirados");
  } catch (err) {
    console.error("Erro ao limpar links expirados:", err);
  }

  const { data: cad, error } = await supabase
    .from("cadastros")
    .select("*, profiles!created_by(nome, email)")
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data: pf } = await supabase
    .from("cadastros_pf")
    .select("*")
    .eq("cadastro_id", id)
    .maybeSingle();
  const { data: pj } = await supabase
    .from("cadastros_pj")
    .select("*")
    .eq("cadastro_id", id)
    .maybeSingle();
  const { data: enderecos } = await supabase
    .from("cadastros_enderecos")
    .select("*")
    .eq("cadastro_id", id)
    .order("tipo_endereco");

  const endEmpresa = (enderecos ?? []).find(
    (e: Endereco) => e.tipo_endereco === "empresa",
  );
  const endEntrega = (enderecos ?? []).find(
    (e: Endereco) => e.tipo_endereco === "entrega",
  );
  const endCobranca = (enderecos ?? []).find(
    (e: Endereco) => e.tipo_endereco === "cobranca",
  );

  return {
    cadastro: cad,
    pf,
    pj,
    enderecos: enderecos ?? [],
    endEmpresa,
    endEntrega,
    endCobranca,
  };
}

export async function deletarCadastro(id: string) {
  const { error } = await supabase.from("cadastros").delete().eq("id", id);
  if (error) throw error;
}

export async function criarCadastro(input: CadastroInput) {
  const token = crypto.randomUUID();
  const { data, error } = await supabase
    .from("cadastros")
    .insert({
      ...input,
      token_acesso: token,
      status: "link_gerado",
      data_criacao_link: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Cadastro;
}

export async function atualizarCadastro(id: string, input: Partial<Cadastro>) {
  const { data, error } = await supabase
    .from("cadastros")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Cadastro;
}

export async function aprovarCadastro(id: string, codigo_cliente: string) {
  const cadastro = await atualizarCadastro(id, {
    status: "aprovado",
    codigo_cliente,
    data_finalizacao: new Date().toISOString(),
    revisado: true,
  });

  const { error } = await supabase.from("clientes").insert({
    cadastro_id: cadastro.id,
    codigo_cliente: cadastro.codigo_cliente,
    tipo_pessoa: cadastro.tipo_pessoa,
    nome_doutor: cadastro.lead_nome || cadastro.nome_temporario || "Sem nome",
    nome_clinica: null,
    telefone_contato: cadastro.lead_whatsapp,
    lead_email: cadastro.lead_email,
    lead_whatsapp: cadastro.lead_whatsapp,
    observacoes: cadastro.observacoes,
    colaborador: cadastro.colaborador,
    status: "ativo",
    fonte: "cadastros",
  });

  if (error) {
    throw new Error(
      `Cadastro ${cadastro.id} foi marcado como aprovado, mas a criação do cliente falhou: ${error.message}. Verifique manualmente antes de aprovar novamente.`,
    );
  }

  return cadastro;
}

export async function reprovarCadastro(id: string, motivo: string) {
  return atualizarCadastro(id, {
    status: "reprovado",
    comentario_reprovacao: motivo,
    data_finalizacao: new Date().toISOString(),
  });
}

type CadastroCorrecaoInput = {
  status: "em_correcao";
  comentario_reprovacao: string;
  token_acesso: string;
  link_expiracao: string;
  inicio_preenchimento: null;
  status_verificacao_token: boolean;
  dados_extras: null;
};

export async function solicitarCorrecao(
  id: string,
  comentario: string,
  camposCorrecao: string[],
) {
  const novoToken = crypto.randomUUID();
  const linkExpiracao = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toISOString();

  const correcaoInput: CadastroCorrecaoInput = {
    status: "em_correcao",
    comentario_reprovacao: comentario,
    token_acesso: novoToken,
    link_expiracao: linkExpiracao,
    inicio_preenchimento: null,
    status_verificacao_token: true,
    dados_extras: null,
  };

  return atualizarCadastro(id, { ...correcaoInput, campos_correcao: camposCorrecao });
}

export const STATUS_LABEL: Record<CadastroStatus, string> = {
  link_gerado: "Link Gerado",
  dados_enviados: "Dados Enviados",
  em_analise: "Em Análise",
  em_correcao: "Em Correção",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export const STATUS_COLOR: Record<CadastroStatus, string> = {
  link_gerado: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  dados_enviados: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
  em_analise: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  em_correcao: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  aprovado: "bg-green-500/15 text-green-400 border border-green-500/20",
  reprovado: "bg-red-500/15 text-red-400 border border-red-500/20",
};

const STATUS_ORDER: Record<CadastroStatus, number> = {
  link_gerado: 0,
  dados_enviados: 1,
  em_analise: 2,
  em_correcao: 3,
  aprovado: 4,
  reprovado: 5,
};

export function getStatusOrder(s: CadastroStatus): number {
  return STATUS_ORDER[s];
}
