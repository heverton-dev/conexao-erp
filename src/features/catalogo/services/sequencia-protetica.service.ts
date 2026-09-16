import { supabase } from "~/core/supabase"

export interface CatalogoSeqProtetica {
  id: string
  nome: string
  sigla?: string | null
  ativo?: boolean
}

export async function listarSeqProteticas(): Promise<CatalogoSeqProtetica[]> {
  const { data, error } = await supabase
    .from("catalogo_seq_proteticas")
    .select("id, nome, sigla")
    .eq("ativo", true)
    .order("nome")
  if (error) throw error
  return data as CatalogoSeqProtetica[]
}

export async function listarSeqProteticasAbutment(abutmentSku: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_seq_protetica_abutments")
    .select("seq_id")
    .eq("abutment_sku", abutmentSku)
  if (error) throw error
  return (data as { seq_id: string }[]).map((r) => r.seq_id)
}

export async function salvarSeqProteticasAbutment(abutmentSku: string, seqIds: string[]): Promise<void> {
  await supabase.from("catalogo_seq_protetica_abutments").delete().eq("abutment_sku", abutmentSku)
  if (seqIds.length === 0) return
  const rows = seqIds.map((seqId) => ({ abutment_sku: abutmentSku, seq_id: seqId }))
  const { error } = await supabase.from("catalogo_seq_protetica_abutments").insert(rows)
  if (error) throw error
}

export async function listarTodasSeqProteticas(): Promise<CatalogoSeqProtetica[]> {
  const { data, error } = await supabase
    .from("catalogo_seq_proteticas")
    .select("id, nome, sigla, ativo")
    .order("nome")
  if (error) throw error
  return (data as CatalogoSeqProtetica[]) ?? []
}

export async function criarSeqProtetica(input: { nome: string; sigla?: string | null; ativo?: boolean }): Promise<CatalogoSeqProtetica> {
  const { data, error } = await supabase
    .from("catalogo_seq_proteticas")
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoSeqProtetica
}

export async function atualizarSeqProtetica(id: string, input: Partial<{ nome: string; sigla: string | null; ativo: boolean }>): Promise<CatalogoSeqProtetica> {
  const { data, error } = await supabase
    .from("catalogo_seq_proteticas")
    .update(input)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as CatalogoSeqProtetica
}

export async function toggleSeqProteticaAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("catalogo_seq_proteticas").update({ ativo }).eq("id", id)
  if (error) throw error
}

export async function removerSeqProtetica(id: string): Promise<void> {
  const { error } = await supabase.from("catalogo_seq_proteticas").delete().eq("id", id)
  if (error) throw error
}

export async function listarAbutmentsDaSeq(seqId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("catalogo_seq_protetica_abutments")
    .select("abutment_sku")
    .eq("seq_id", seqId)
  if (error) throw error
  return (data as { abutment_sku: string }[]).map((r) => r.abutment_sku)
}

export async function listarEtapasComponentesDaSeq(seqId: string): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from("catalogo_seq_protetica_etapa_componentes")
    .select("etapa_id, componente_sku")
    .eq("seq_id", seqId)
  if (error) throw error
  const result: Record<string, string[]> = {}
  for (const row of (data ?? []) as { etapa_id: string; componente_sku: string }[]) {
    if (!result[row.etapa_id]) result[row.etapa_id] = []
    result[row.etapa_id].push(row.componente_sku)
  }
  return result
}

export async function salvarComposicaoSeq(
  seqId: string,
  data: { abutment_sku: string; etapasComponentes: Record<string, string[]> },
): Promise<void> {
  // 1. Abutments (single)
  await supabase.from("catalogo_seq_protetica_abutments").delete().eq("seq_id", seqId)
  if (data.abutment_sku) {
    await supabase.from("catalogo_seq_protetica_abutments").insert({ seq_id: seqId, abutment_sku: data.abutment_sku })
  }

  // 2. Etapas (pivô)
  const etapaIds = Object.keys(data.etapasComponentes)
  await supabase.from("catalogo_seq_protetica_etapas").delete().eq("seq_id", seqId)
  if (etapaIds.length > 0) {
    await supabase.from("catalogo_seq_protetica_etapas").insert(etapaIds.map((eid) => ({ seq_id: seqId, etapa_id: eid })))
  }

  // 3. Etapa→Componentes (pivô)
  await supabase.from("catalogo_seq_protetica_etapa_componentes").delete().eq("seq_id", seqId)
  const inserts: { seq_id: string; etapa_id: string; componente_sku: string }[] = []
  for (const [etapaId, comps] of Object.entries(data.etapasComponentes)) {
    for (const sku of comps) {
      inserts.push({ seq_id: seqId, etapa_id: etapaId, componente_sku: sku })
    }
  }
  if (inserts.length > 0) {
    await supabase.from("catalogo_seq_protetica_etapa_componentes").insert(inserts)
  }
}
