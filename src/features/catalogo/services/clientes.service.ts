import { supabase } from "~/lib/supabase"
import type {
  CatalogoCliente,
  CatalogoClienteInput,
  CatalogoClientePermissao,
  CatalogoClientePermissaoKey,
} from "../types/clientes"

// ============================================================
// Types: Cadastro disponível para vinculação
// ============================================================

export interface CadastroDisponivel {
  id: string
  lead_nome: string | null
  lead_email: string | null
  lead_whatsapp: string | null
  status: string
  pf?: { nome: string; email_comunicacao: string; celular1: string } | null
  pj?: { razao_social: string; email_comunicacao: string; celular1: string } | null
}

// ============================================================
// CRUD Clientes do Catálogo
// ============================================================

export async function listarClientes(
  filters?: { tipo?: string; ativo?: boolean; search?: string; grupo_id?: string },
): Promise<CatalogoCliente[]> {
  let query = supabase
    .from("catalogo_clientes")
    .select("*, grupo:catalogo_grupos_clientes(*)")
    .order("nome")

  if (filters?.tipo) query = query.eq("tipo", filters.tipo)
  if (filters?.ativo !== undefined) query = query.eq("ativo", filters.ativo)
  if (filters?.grupo_id) query = query.eq("grupo_id", filters.grupo_id)
  if (filters?.search) {
    query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as CatalogoCliente[]
}

export async function buscarCliente(id: string): Promise<CatalogoCliente | null> {
  const { data, error } = await supabase
    .from("catalogo_clientes")
    .select("*, grupo:catalogo_grupos_clientes(*)")
    .eq("id", id)
    .single()
  if (error) return null
  return data as CatalogoCliente
}

export async function buscarClientePorUserId(userId: string): Promise<CatalogoCliente | null> {
  const { data, error } = await supabase
    .from("catalogo_clientes")
    .select("*, grupo:catalogo_grupos_clientes(*)")
    .eq("user_id", userId)
    .eq("ativo", true)
    .single()
  if (error) return null
  return data as CatalogoCliente
}

export async function criarCliente(
  input: CatalogoClienteInput,
): Promise<CatalogoCliente> {
  // Se tem cadastro_id, busca dados do cadastro para preencher nome/email
  let nome = input.nome
  let email = input.email
  let telefone = input.telefone ?? null

  if (input.cadastro_id && !input.nome) {
    const { data: cad } = await supabase
      .from("cadastros")
      .select("lead_nome, lead_email, lead_whatsapp, pf:cadastros_pf(nome, email_comunicacao, celular1), pj:cadastros_pj(razao_social, email_comunicacao, celular1)")
      .eq("id", input.cadastro_id)
      .single()

    if (cad) {
      nome = cad.lead_nome ?? (cad.pf as any)?.nome ?? (cad.pj as any)?.razao_social ?? ""
      email = cad.lead_email ?? (cad.pf as any)?.email_comunicacao ?? (cad.pj as any)?.email_comunicacao ?? ""
      telefone = cad.lead_whatsapp ?? (cad.pf as any)?.celular1 ?? (cad.pj as any)?.celular1 ?? null
    }
  }

  // Cria auth user se tem senha
  let userId: string | null = null
  if (input.senha) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: input.senha,
      email_confirm: true,
      user_metadata: { nome },
    })
    if (authError) throw authError
    userId = authData.user.id
  }

  const { data, error } = await supabase
    .from("catalogo_clientes")
    .insert({
      cadastro_id: input.cadastro_id ?? null,
      user_id: userId,
      grupo_id: input.grupo_id ?? null,
      nome,
      email,
      telefone,
      tipo: input.tipo ?? "cliente",
      ativo: input.ativo ?? true,
    })
    .select("*, grupo:catalogo_grupos_clientes(*)")
    .single()
  if (error) throw error
  return data as CatalogoCliente
}

export async function atualizarCliente(
  id: string,
  input: Partial<CatalogoClienteInput>,
): Promise<CatalogoCliente> {
  const { senha, ...rest } = input
  const { data, error } = await supabase
    .from("catalogo_clientes")
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, grupo:catalogo_grupos_clientes(*)")
    .single()
  if (error) throw error
  return data as CatalogoCliente
}

export async function deletarCliente(id: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_clientes")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ============================================================
// Cadastros disponíveis para vinculação
// ============================================================

export async function listarCadastrosDisponiveis(
  search?: string,
): Promise<CadastroDisponivel[]> {
  const { data: vinculados } = await supabase
    .from("catalogo_clientes")
    .select("cadastro_id")
    .not("cadastro_id", "is", null)

  const idsVinculados = (vinculados ?? []).map((v) => v.cadastro_id).filter(Boolean)

  let query = supabase
    .from("cadastros")
    .select("id, lead_nome, lead_email, lead_whatsapp, status, pf:cadastros_pf(nome, email_comunicacao, celular1), pj:cadastros_pj(razao_social, email_comunicacao, celular1)")
    .in("status", ["aprovado", "em_analise"])
    .order("created_at", { ascending: false })
    .limit(50)

  // Excluir já vinculados
  if (idsVinculados.length > 0) {
    query = query.not("id", "in", `(${idsVinculados.join(",")})`)
  }

  if (search) {
    query = query.or(`lead_nome.ilike.%${search}%,lead_email.ilike.%${search}%,nome_temporario.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as CadastroDisponivel[]
}

// ============================================================
// Permissões do Cliente
// ============================================================

export async function listarPermissoesCliente(
  clienteId: string,
): Promise<CatalogoClientePermissao[]> {
  const { data, error } = await supabase
    .from("catalogo_cliente_permissoes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("permissao_key")
  if (error) throw error
  return data as CatalogoClientePermissao[]
}

export async function salvarPermissoesCliente(
  clienteId: string,
  permissoes: CatalogoClientePermissaoKey[],
): Promise<void> {
  // Deleta existentes
  await supabase
    .from("catalogo_cliente_permissoes")
    .delete()
    .eq("cliente_id", clienteId)

  // Insere novas
  if (permissoes.length > 0) {
    const rows = permissoes.map((key) => ({
      cliente_id: clienteId,
      permissao_key: key,
      ativo: true,
    }))
    const { error } = await supabase
      .from("catalogo_cliente_permissoes")
      .insert(rows)
    if (error) throw error
  }
}

export async function clienteTemPermissao(
  clienteId: string,
  permissao: CatalogoClientePermissaoKey,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("catalogo_cliente_permissoes")
    .select("id")
    .eq("cliente_id", clienteId)
    .eq("permissao_key", permissao)
    .eq("ativo", true)
    .maybeSingle()
  if (error) return false
  return !!data
}
