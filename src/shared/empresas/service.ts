import { supabase } from "~/core/supabase";
import type { Empresa, EmpresaDesign, ModuloEmpresa } from "./types";

export async function listarEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase.from("empresas").select("*").order("nome");
  if (error) throw error;
  return (data ?? []) as Empresa[];
}

export async function buscarEmpresa(id: string): Promise<Empresa | null> {
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Empresa | null;
}

export async function criarEmpresa(input: {
  nome: string;
  slug: string;
  cnpj?: string;
  razao_social?: string;
  nome_app?: string;
  email?: string;
  celular?: string;
  telefone?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  site?: string;
  theme?: Record<string, string>;
  logo_index_url?: string;
  logo_app_url?: string;
  favicon_url?: string;
}): Promise<Empresa> {
  const { theme, logo_index_url, logo_app_url, favicon_url, ...empresaData } =
    input;
  const { data, error } = await supabase
    .from("empresas")
    .insert(empresaData)
    .select()
    .single();
  if (error) throw error;
  const empresa = data as Empresa;
  const { error: configError } = await supabase.from("empresas_config").upsert({
    empresa_id: empresa.id,
    logo_url: null,
    logo_index_url: logo_index_url || null,
    logo_app_url: logo_app_url || null,
    favicon_url: favicon_url || null,
    theme: theme || {},
    updated_at: new Date().toISOString(),
  });
  if (configError) throw new Error(`Erro ao criar config da empresa: ${configError.message}`);
  return empresa;
}

export async function atualizarEmpresa(
  id: string,
  input: Partial<{
    nome: string;
    slug: string;
    cnpj: string;
    razao_social: string;
    nome_app: string;
    email: string;
    celular: string;
    telefone: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    instagram: string;
    youtube: string;
    linkedin: string;
    site: string;
    ativo: boolean;
  }>,
): Promise<Empresa> {
  const { data, error } = await supabase
    .from("empresas")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Empresa;
}

export async function deletarEmpresa(id: string): Promise<void> {
  const tables = ["empresas_config", "empresa_modulos", "credenciais", "profiles"];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("empresa_id", id);
    if (error) console.error(`Erro ao deletar ${table}:`, error);
  }
  const { error } = await supabase.from("empresas").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleEmpresa(id: string, ativo: boolean): Promise<void> {
  await atualizarEmpresa(id, { ativo });
}

export async function buscarEmpresaDesign(
  empresaId: string,
): Promise<EmpresaDesign | null> {
  const { data, error } = await supabase
    .from("empresas_config")
    .select("*")
    .eq("empresa_id", empresaId)
    .single();
  if (error) throw error;
  return data as EmpresaDesign | null;
}

/** @deprecated Use buscarEmpresaDesign */
export const buscarEmpresaConfig = buscarEmpresaDesign;

export async function salvarEmpresaDesign(
  empresaId: string,
  input: {
    logo_url?: string;
    logo_index_url?: string;
    logo_app_url?: string;
    favicon_url?: string;
    theme?: Record<string, string>;
    db_config?: Record<string, string>;
  },
): Promise<void> {
  const payload = { ...input, updated_at: new Date().toISOString() };
  const { error } = await supabase
    .from("empresas_config")
    .upsert({ empresa_id: empresaId, ...payload });
  if (error) throw error;
}

/** @deprecated Use salvarEmpresaDesign */
export const salvarEmpresaConfig = salvarEmpresaDesign;

export async function listarModulosEmpresa(
  empresaId: string,
): Promise<ModuloEmpresa[]> {
  const { data, error } = await supabase
    .from("empresa_modulos")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("modulo_key");
  if (error) throw error;
  return (data ?? []) as ModuloEmpresa[];
}

export async function toggleModuloEmpresa(
  id: string,
  ativo: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("empresa_modulos")
    .update({ ativo })
    .eq("id", id);
  if (error) throw error;
}

export async function upsertModuloEmpresa(
  empresaId: string,
  moduloKey: string,
  ativo: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("empresa_modulos")
    .upsert(
      { empresa_id: empresaId, modulo_key: moduloKey, ativo },
      { onConflict: "empresa_id,modulo_key" },
    );
  if (error) throw error;
}

export async function uploadEmpresaLogo(
  empresaId: string,
  tipo: "logo_index" | "logo_app" | "favicon",
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const fileName = `logos/${empresaId}/${tipo}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(fileName, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("logos")
    .getPublicUrl(fileName);

  return urlData?.publicUrl || "";
}

export async function deletarEmpresaLogo(
  empresaId: string,
  tipo: "logo_index" | "logo_app" | "favicon",
) {
  const { data: files } = await supabase.storage
    .from("logos")
    .list(`logos/${empresaId}`);
  const match = files?.find((f) => f.name.startsWith(tipo));
  if (match) {
    await supabase.storage
      .from("logos")
      .remove([`logos/${empresaId}/${match.name}`]);
  }
}

export async function criarUsuarioEmpresa(input: {
  nome: string;
  email: string;
  senha: string;
  empresa_id: string;
  role: string;
  celular?: string;
}): Promise<string | null> {
  const { data: userId, error: rpcErr } = await supabase.rpc(
    "admin_criar_usuario",
    {
      p_email: input.email,
      p_senha: input.senha,
      p_nome: input.nome,
      p_empresa_id: input.empresa_id,
      p_is_super_admin: false,
    },
  );
  if (rpcErr) throw rpcErr;
  if (userId) {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ role: input.role, nome: input.nome, celular: input.celular || null })
      .eq("id", userId);
    if (updateErr) throw updateErr;
  }
  return userId as string | null;
}

export async function ativarModulosParaEmpresa(
  empresaId: string,
  modulos: string[],
): Promise<void> {
  const inserts = modulos.map((modulo_key) => ({
    empresa_id: empresaId,
    modulo_key,
    ativo: true,
  }));
  const { error } = await supabase.from("empresa_modulos").insert(inserts);
  if (error) throw error;
}
