import { supabase } from "~/core/supabase"
import type { CatalogoCpsTipoWorkflow, CatalogoCpsEtapaWorkflow } from "../types"

// ============================================================
// Tipos de Workflow
// ============================================================

export async function listarTiposWorkflow(): Promise<CatalogoCpsTipoWorkflow[]> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_workflows")
    .select("*")
    .order("nome")
  if (error) throw error
  return (data as CatalogoCpsTipoWorkflow[]) ?? []
}

export async function criarTipoWorkflow(input: { nome: string; sigla?: string | null }): Promise<CatalogoCpsTipoWorkflow> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_workflows")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCpsTipoWorkflow
}

export async function atualizarTipoWorkflow(id: string, input: Partial<{ nome: string; sigla: string | null; ativo: boolean }>): Promise<CatalogoCpsTipoWorkflow> {
  const { data, error } = await supabase
    .from("catalogo_cps_tipos_workflows")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCpsTipoWorkflow
}

export async function toggleTipoWorkflowAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_workflows").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerTipoWorkflow(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_tipos_workflows").delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Etapas do Workflow
// ============================================================

export async function listarEtapas(tipoWorkflowId?: string): Promise<CatalogoCpsEtapaWorkflow[]> {
  let query = supabase
    .from("catalogo_cps_etapas_workflows")
    .select("*, tipo_workflow:catalogo_cps_tipos_workflows(*)")
    .order("ordem")
  if (tipoWorkflowId) query = query.eq("tipo_workflow_id", tipoWorkflowId)
  const { data, error } = await query
  if (error) throw error
  return (data as CatalogoCpsEtapaWorkflow[]) ?? []
}

export async function criarEtapa(input: {
  tipo_workflow_id: string; nome: string; sigla?: string; ordem?: number
}): Promise<CatalogoCpsEtapaWorkflow> {
  const { data, error } = await supabase
    .from("catalogo_cps_etapas_workflows")
    .insert({ ...input })
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCpsEtapaWorkflow
}
export async function atualizarEtapa(id: string, input: Partial<{ tipo_workflow_id: string; nome: string; sigla: string | null; ordem: number; ativo: boolean }>): Promise<CatalogoCpsEtapaWorkflow> {
  const { data, error } = await supabase
    .from("catalogo_cps_etapas_workflows")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoCpsEtapaWorkflow
}


export async function toggleEtapaAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_etapas_workflows").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerEtapa(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_cps_etapas_workflows").delete().eq("id", id)
  if (error) throw error
}

// ============================================================
// Detalhe do Workflow (com etapas)
// ============================================================

export async function getWorkflowDetalhe(workflowId: string): Promise<{
  workflow: CatalogoCpsTipoWorkflow
  etapas: CatalogoCpsEtapaWorkflow[]
} | null> {
  const { data: workflow, error: wErr } = await supabase
    .from("catalogo_cps_tipos_workflows")
    .select("*")
    .eq("id", workflowId)
    .single()
  if (wErr) throw wErr

  const etapas = await listarEtapas(workflowId)

  return { workflow: workflow as CatalogoCpsTipoWorkflow, etapas }
}

// ============================================================
// Backward-compatible aliases
// ============================================================

/** @deprecated Use listarTiposWorkflow */
export const listarWorkflows = listarTiposWorkflow
/** @deprecated Use toggleTipoWorkflowAtivo */
export const toggleWorkflowAtivo = toggleTipoWorkflowAtivo
/** @deprecated Guias de reabilitacao removidas */
export async function listarGuias(): Promise<[]> { return [] }
