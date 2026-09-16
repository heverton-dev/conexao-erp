import { supabase } from "~/lib/supabase"
import type {
  CatalogoSolicitacaoAcesso,
  CatalogoSolicitacaoAcessoInput,
  SolicitacaoStatus,
} from "../types/clientes"
import { dispararEventoModulo } from "~/core/services/webhooks"

const MODULO_KEY = "catalogo"

export async function listarSolicitacoes(
  filters?: { status?: SolicitacaoStatus },
): Promise<CatalogoSolicitacaoAcesso[]> {
  let query = supabase
    .from("catalogo_solicitacoes_acesso")
    .select("*")
    .order("created_at", { ascending: false })

  if (filters?.status) query = query.eq("status", filters.status)

  const { data, error } = await query
  if (error) throw error
  return data as CatalogoSolicitacaoAcesso[]
}

export async function criarSolicitacao(
  input: CatalogoSolicitacaoAcessoInput,
): Promise<CatalogoSolicitacaoAcesso> {
  const { data, error } = await supabase
    .from("catalogo_solicitacoes_acesso")
    .insert({
      nome: input.nome,
      email: input.email,
      telefone: input.telefone ?? null,
      mensagem: input.mensagem ?? null,
    })
    .select()
    .single()
  if (error) throw error

  dispararEventoModulo(MODULO_KEY, "solicitacao_acesso.criada", {
    solicitacao_id: data.id,
  }).catch(() => {})

  return data as CatalogoSolicitacaoAcesso
}

export async function responderSolicitacao(
  id: string,
  status: "aprovada" | "rejeitada",
  respondedBy: string,
): Promise<CatalogoSolicitacaoAcesso> {
  const { data, error } = await supabase
    .from("catalogo_solicitacoes_acesso")
    .update({
      status,
      responded_by: respondedBy,
      responded_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  const eventoKey = `solicitacao_acesso.${status}` as const
  dispararEventoModulo(MODULO_KEY, eventoKey, {
    solicitacao_id: id,
  }).catch(() => {})

  return data as CatalogoSolicitacaoAcesso
}

export async function deletarSolicitacao(id: string): Promise<void> {
  const { error } = await supabase
    .from("catalogo_solicitacoes_acesso")
    .delete()
    .eq("id", id)
  if (error) throw error
}
