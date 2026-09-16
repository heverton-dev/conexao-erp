import { supabase } from "~/core/supabase"
import type {
  ImportType, ImportProgress, ImportResult,
  ImportResultDetail, ImportError, ValidatedRow
} from "../types"
import { IMPORT_FIELD_CONFIGS, PROMOCIONAL_ITEM_TIPOS, type FkResolverConfig, type ImportTypeConfig, type ListPivotConfig } from "../constants"

const BATCH_SIZE = 50

export interface ResolverCache {
  ids: Map<string, string>
}

export function createResolverCache(): ResolverCache {
  return { ids: new Map() }
}

interface ExecuteImportParams {
  importType: ImportType
  validRows: ValidatedRow[]
  editedRows: Map<number, Record<string, unknown>>
  onProgress: (progress: ImportProgress) => void
  cache?: ResolverCache
}

export async function executeImport(params: ExecuteImportParams): Promise<ImportResult> {
  const { importType, validRows, editedRows, onProgress } = params
  const cache = params.cache ?? createResolverCache()
  const config = IMPORT_FIELD_CONFIGS[importType]
  const startTime = Date.now()

  const progress: ImportProgress = {
    status: "executing",
    currentStep: 4,
    totalSteps: 5,
    currentBatch: 0,
    totalBatches: Math.ceil(validRows.length / BATCH_SIZE),
    processedRows: 0,
    totalRows: validRows.length,
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: [],
    startTime,
  }

  const details: ImportResultDetail[] = []

  for (let i = 0; i < validRows.length; i++) {
    const validatedRow = validRows[i]
    const edited = editedRows.get(validatedRow.rowIndex)
    const row = { ...validatedRow.data, ...(edited ?? {}) }

    try {
      const rowDetails = await processRow(config, row, cache)
      details.push(...rowDetails.details)
      progress.insertedCount += rowDetails.inserted
      progress.updatedCount += rowDetails.updated

      for (const errMsg of rowDetails.errors) {
        progress.errors.push({
          rowIndex: validatedRow.rowIndex,
          data: row,
          error: errMsg,
          errorCode: "IMPORT_ROW_FAILED",
          recoverable: true,
        })
      }
      progress.errorCount += rowDetails.errors.length
    } catch (err) {
      progress.errorCount += 1
      progress.errors.push({
        rowIndex: validatedRow.rowIndex,
        data: row,
        error: String(err instanceof Error ? err.message : err),
        errorCode: "UNKNOWN",
        recoverable: false,
      })
    }

    progress.processedRows = i + 1
    progress.currentBatch = Math.floor(i / BATCH_SIZE) + 1

    if ((i + 1) % 10 === 0 || i === validRows.length - 1) {
      const elapsed = Date.now() - startTime
      const avgTimePerRow = elapsed / (i + 1)
      progress.estimatedTimeRemaining = Math.round(avgTimePerRow * (validRows.length - i - 1) / 1000)
      onProgress({ ...progress, errors: [...progress.errors] })
    }
  }

  await fireImportEvents(importType, details)

  return {
    success: progress.errorCount === 0,
    inserted: progress.insertedCount,
    updated: progress.updatedCount,
    skipped: progress.skippedCount,
    errors: progress.errors,
    duration: Date.now() - startTime,
    details,
  }
}

async function processRow(
  config: ImportTypeConfig,
  row: Record<string, unknown>,
  cache: ResolverCache,
): Promise<{ inserted: number; updated: number; errors: string[]; details: ImportResultDetail[] }> {
  const details: ImportResultDetail[] = []
  const errors: string[] = []

  const { resolvedIds, errors: fkErrors, createdDetails } = await resolveRowFks(config, row, cache)
  errors.push(...fkErrors)
  for (const created of createdDetails) {
    details.push({ entity: created.table, action: "inserted", identifier: created.label })
  }

  if (fkErrors.length > 0) {
    return { inserted: 0, updated: 0, errors, details }
  }

  if (config.skipMainUpsert) {
    return { inserted: createdDetails.length, updated: 0, errors, details }
  }

  if (!config.buildRecord) {
    errors.push(`Config de import sem buildRecord para ${config.supabaseTable}`)
    return { inserted: 0, updated: 0, errors, details }
  }

  const record = config.buildRecord(row, resolvedIds)
  const upsertResult = await upsertRecord(config, record)

  if (upsertResult.error) {
    errors.push(upsertResult.error)
    return { inserted: 0, updated: 0, errors, details }
  }

  details.push({
    entity: config.supabaseTable,
    action: upsertResult.action,
    identifier: upsertResult.sku ?? upsertResult.id ?? "",
  })

  if (config.listPivots && upsertResult.id) {
    const pivotErrors = await handleListPivots(config.listPivots, row, {
      id: upsertResult.id,
      sku: upsertResult.sku,
    }, cache)
    errors.push(...pivotErrors)
  }

  if (config.supabaseTable === "catalogo_promocionais" && upsertResult.id) {
    const itemErrors = await handlePromocionalItens(row, upsertResult.id)
    errors.push(...itemErrors)
  }

  return {
    inserted: upsertResult.action === "inserted" ? 1 : 0,
    updated: upsertResult.action === "updated" ? 1 : 0,
    errors,
    details,
  }
}

async function resolveRowFks(
  config: ImportTypeConfig,
  row: Record<string, unknown>,
  cache: ResolverCache,
): Promise<{ resolvedIds: Record<string, string>; errors: string[]; createdDetails: { table: string; label: string }[] }> {
  const resolvedIds: Record<string, string> = {}
  const errors: string[] = []
  const createdDetails: { table: string; label: string }[] = []

  for (const resolver of config.fkResolvers) {
    const result = await resolveOrCreateFk(resolver, row, resolvedIds, cache)
    if (result.error) {
      errors.push(result.error)
      continue
    }
    if (result.id) {
      resolvedIds[resolver.targetField] = result.id
      if (result.created) {
        createdDetails.push({ table: resolver.lookupTable, label: String(row[resolver.sourceField] ?? result.id) })
      }
    }
  }

  return { resolvedIds, errors, createdDetails }
}

async function resolveOrCreateFk(
  resolver: FkResolverConfig,
  row: Record<string, unknown>,
  resolvedIds: Record<string, string>,
  cache: ResolverCache,
): Promise<{ id: string | null; created: boolean; error?: string }> {
  const rawValue = row[resolver.sourceField]
  const value = rawValue === null || rawValue === undefined ? "" : String(rawValue).trim()

  if (!value) {
    return {
      id: null,
      created: false,
      error: resolver.required ? `Campo "${resolver.sourceField}" é obrigatório` : undefined,
    }
  }

  const scopeValue = resolver.scopeField ? resolvedIds[resolver.scopeField.fromResolved] ?? "" : ""
  const cacheKey = `${resolver.lookupTable}::${scopeValue}::${value.toLowerCase()}`
  const cached = cache.ids.get(cacheKey)
  if (cached) return { id: cached, created: false }

  let query = supabase.from(resolver.lookupTable).select("id").ilike(resolver.matchField, value)
  if (resolver.scopeField) query = query.eq(resolver.scopeField.column, scopeValue)
  const { data: found } = await query.limit(1).maybeSingle()

  if (found?.id) {
    cache.ids.set(cacheKey, found.id)
    return { id: found.id, created: false }
  }

  if (!resolver.createIfMissing) {
    return {
      id: null,
      created: false,
      error: resolver.required ? `"${value}" não encontrado em ${resolver.lookupTable}` : undefined,
    }
  }

  const payload = resolver.extraCreateFields
    ? resolver.extraCreateFields(row, resolvedIds)
    : { [resolver.matchField]: value }

  const { data: createdRow, error } = await supabase
    .from(resolver.lookupTable)
    .insert(payload)
    .select("id")
    .single()

  if (error || !createdRow) {
    return { id: null, created: false, error: `Falha ao criar em ${resolver.lookupTable}: ${error?.message ?? "erro desconhecido"}` }
  }

  cache.ids.set(cacheKey, createdRow.id)
  return { id: createdRow.id, created: true }
}

async function upsertRecord(
  config: ImportTypeConfig,
  record: Record<string, unknown>,
): Promise<{ id: string | null; sku: string | null; action: "inserted" | "updated"; error?: string }> {
  const sku = typeof record.sku === "string" ? record.sku : null

  if (config.uniqueKeyHasDbConstraint) {
    const { data, error } = await supabase
      .from(config.supabaseTable)
      .upsert(record, { onConflict: config.uniqueKey.join(",") })
      .select()
      .single()
    if (error) return { id: null, sku, action: "inserted", error: error.message }
    const row = data as Record<string, unknown> | null
    const id = (row?.id as string | undefined) ?? (row?.sku as string | undefined) ?? null
    return { id, sku, action: "inserted" }
  }

  let query = supabase.from(config.supabaseTable).select("id")
  for (const key of config.uniqueKey) {
    query = query.eq(key, record[key] as string)
  }
  const { data: existing } = await query.limit(1).maybeSingle()

  if (existing?.id) {
    const { error } = await supabase.from(config.supabaseTable).update(record).eq("id", existing.id)
    if (error) return { id: existing.id, sku, action: "updated", error: error.message }
    return { id: existing.id, sku, action: "updated" }
  }

  const { data: created, error } = await supabase.from(config.supabaseTable).insert(record).select("id").single()
  if (error) return { id: null, sku, action: "inserted", error: error.message }
  return { id: created?.id ?? null, sku, action: "inserted" }
}

async function handleListPivots(
  pivots: ListPivotConfig[],
  row: Record<string, unknown>,
  mainResult: { id: string | null; sku: string | null },
  cache: ResolverCache,
): Promise<string[]> {
  const errors: string[] = []

  for (const pivot of pivots) {
    const raw = row[pivot.sourceField]
    if (raw === null || raw === undefined || String(raw).trim() === "") continue

    const items = String(raw).split(";").map((s) => s.trim()).filter(Boolean)
    if (items.length === 0) continue

    const ownKeyValue = pivot.ownKeyFrom === "sku" ? mainResult.sku : mainResult.id
    if (!ownKeyValue) continue

    const pivotRows: Record<string, unknown>[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      let refValue: string | null = item

      if (pivot.refLookupTable) {
        const matchField = pivot.refMatchField ?? "sku"
        const cacheKey = `${pivot.refLookupTable}::${matchField}::${item.toLowerCase()}`
        let id = cache.ids.get(cacheKey) ?? null
        if (!id) {
          const { data } = await supabase.from(pivot.refLookupTable).select("id").ilike(matchField, item).limit(1).maybeSingle()
          id = data?.id ?? null
          if (id) cache.ids.set(cacheKey, id)
        }
        if (!id) {
          errors.push(`"${item}" não encontrado em ${pivot.refLookupTable} (coluna ${pivot.sourceField})`)
          continue
        }
        refValue = id
      }

      const pivotRow: Record<string, unknown> = { [pivot.ownKeyField]: ownKeyValue, [pivot.refField]: refValue }
      if (pivot.orderField) pivotRow[pivot.orderField] = i + 1
      pivotRows.push(pivotRow)
    }

    if (pivotRows.length > 0) {
      await supabase.from(pivot.pivotTable).delete().eq(pivot.ownKeyField, ownKeyValue)
      const { error } = await supabase.from(pivot.pivotTable).insert(pivotRows)
      if (error) errors.push(`Falha ao gravar ${pivot.pivotTable}: ${error.message}`)
    }
  }

  return errors
}

async function handlePromocionalItens(row: Record<string, unknown>, promocionalId: string): Promise<string[]> {
  const errors: string[] = []
  const raw = row.itens
  if (raw === null || raw === undefined || String(raw).trim() === "") return errors

  const pairs = String(raw).split(";").map((s) => s.trim()).filter(Boolean)
  const itemRows: { promocional_id: string; sku: string; tipo: string }[] = []

  for (const pair of pairs) {
    const [tipo, sku] = pair.split(":").map((s) => s.trim())
    if (!tipo || !sku) {
      errors.push(`Item de promoção inválido: "${pair}" (use formato tipo:sku)`)
      continue
    }
    if (!(PROMOCIONAL_ITEM_TIPOS as readonly string[]).includes(tipo)) {
      errors.push(`Tipo de item inválido: "${tipo}" em "${pair}"`)
      continue
    }
    itemRows.push({ promocional_id: promocionalId, sku, tipo })
  }

  if (itemRows.length > 0) {
    await supabase.from("catalogo_promocional_itens").delete().eq("promocional_id", promocionalId)
    const { error } = await supabase.from("catalogo_promocional_itens").insert(itemRows)
    if (error) errors.push(`Falha ao gravar itens promocionais: ${error.message}`)
  }

  return errors
}

async function fireImportEvents(
  importType: ImportType,
  details: ImportResultDetail[]
): Promise<void> {
  try {
    const { dispararEventoModulo } = await import("~/core/services/webhooks")
    const inserts = details.filter((d) => d.action === "inserted")
    if (inserts.length > 0) {
      dispararEventoModulo("catalogo", "importacao.concluida", {
        import_type: importType,
        count: inserts.length,
      }).catch(() => {})
    }
  } catch {
    // webhook import failed — non-critical
  }
}
