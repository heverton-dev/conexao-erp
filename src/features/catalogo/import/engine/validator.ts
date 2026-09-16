import type {
  ImportType, RowValidation, ValidatedRow,
  ValidationResult, ValidationSummary
} from "../types"
import { IMPORT_FIELD_CONFIGS } from "../constants"
import { supabase } from "~/core/supabase"

export interface ValidationCache {
  /** `${lookupTable}::${matchField}::${valorLowerCase}` -> existe no banco */
  fkExists: Map<string, boolean>
  existingSkus: Set<string>
}

export async function loadValidationCache(
  importType: ImportType,
  rows: Record<string, unknown>[],
): Promise<ValidationCache> {
  const config = IMPORT_FIELD_CONFIGS[importType]
  const fkExists = new Map<string, boolean>()

  for (const resolver of config.fkResolvers) {
    const values = Array.from(new Set(
      rows
        .map((r) => r[resolver.sourceField])
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
        .map((v) => v.trim()),
    ))
    if (values.length === 0) continue

    const { data } = await supabase.from(resolver.lookupTable).select(resolver.matchField).in(resolver.matchField, values)
    const foundSet = new Set((data ?? []).map((r) => String((r as unknown as Record<string, unknown>)[resolver.matchField]).toLowerCase()))
    for (const v of values) {
      fkExists.set(`${resolver.lookupTable}::${resolver.matchField}::${v.toLowerCase()}`, foundSet.has(v.toLowerCase()))
    }
  }

  let existingSkus = new Set<string>()
  if (config.uniqueKeyHasDbConstraint && config.uniqueKey.includes("sku")) {
    const skus = Array.from(new Set(
      rows.map((r) => r.sku).filter((v): v is string => typeof v === "string" && v.trim() !== ""),
    ))
    if (skus.length > 0) {
      const { data } = await supabase.from(config.supabaseTable).select("sku").in("sku", skus)
      existingSkus = new Set((data ?? []).map((r) => (r as { sku: string }).sku))
    }
  }

  return { fkExists, existingSkus }
}

interface ValidateRowsParams {
  importType: ImportType
  rows: Record<string, unknown>[]
  cache?: ValidationCache
}

export function validateRows(params: ValidateRowsParams): ValidationResult {
  const { importType, rows, cache } = params
  const config = IMPORT_FIELD_CONFIGS[importType]
  const errors: RowValidation[] = []
  const warnings: RowValidation[] = []
  const validatedRows: ValidatedRow[] = []

  rows.forEach((row, index) => {
    const rowErrors: RowValidation[] = []
    const rowWarnings: RowValidation[] = []

    for (const field of config.targetFields.filter((f) => f.required)) {
      const value = row[field.key]
      if (value === null || value === undefined || value === "") {
        rowErrors.push({
          rowIndex: index,
          severity: "error",
          field: field.key,
          message: `Campo "${field.label}" é obrigatório`,
        })
      }
    }

    for (const field of config.targetFields) {
      const value = row[field.key]
      if (value === null || value === undefined || value === "") continue

      if (field.type === "number" && isNaN(Number(value))) {
        rowErrors.push({
          rowIndex: index,
          severity: "error",
          field: field.key,
          message: `"${field.label}" deve ser numérico. Valor: "${value}"`,
          value,
        })
      }

      if (field.transform?.type === "enum" && field.transform.values) {
        const normalized = String(value).trim().toLowerCase()
        if (!field.transform.values.some((v) => v.toLowerCase() === normalized)) {
          rowErrors.push({
            rowIndex: index,
            severity: "error",
            field: field.key,
            message: `"${field.label}" inválido: "${value}". Use: ${field.transform.values.join(", ")}`,
          })
        }
      }
    }

    for (const resolver of config.fkResolvers) {
      const raw = row[resolver.sourceField]
      const value = raw === null || raw === undefined ? "" : String(raw).trim()
      if (!value) continue // required-vazio já reportado acima via targetFields, se aplicável

      const key = `${resolver.lookupTable}::${resolver.matchField}::${value.toLowerCase()}`
      const exists = cache?.fkExists.get(key)
      if (exists === false) {
        if (resolver.createIfMissing) {
          rowWarnings.push({
            rowIndex: index, severity: "warning", field: resolver.sourceField,
            message: `"${value}" não existe em ${resolver.lookupTable} e será criado automaticamente`,
            suggestion: "Criar automaticamente",
          })
        } else if (resolver.required) {
          rowErrors.push({
            rowIndex: index, severity: "error", field: resolver.sourceField,
            message: `"${value}" não encontrado em ${resolver.lookupTable}`,
          })
        } else {
          rowWarnings.push({
            rowIndex: index, severity: "warning", field: resolver.sourceField,
            message: `"${value}" não encontrado em ${resolver.lookupTable} — campo ficará vazio`,
          })
        }
      }
    }

    if (row.sku && cache?.existingSkus.has(String(row.sku))) {
      rowWarnings.push({
        rowIndex: index,
        severity: "warning",
        field: "sku",
        message: `SKU "${row.sku}" já existe no sistema. Será atualizado.`,
        suggestion: "Atualizar registro existente",
      })
    }

    if (importType === "implantes") {
      const d = Number(row.diametro_mm)
      const c = Number(row.comprimento_mm)
      if (d > 0 && c > 0 && d > c) {
        rowWarnings.push({
          rowIndex: index, severity: "warning", field: "diametro_mm",
          message: "Diâmetro maior que comprimento — confirme os valores",
        })
      }
    }

    errors.push(...rowErrors)
    warnings.push(...rowWarnings)
    validatedRows.push({
      rowIndex: index,
      data: row,
      validations: [...rowErrors, ...rowWarnings],
      isValid: rowErrors.length === 0,
      isEditable: true,
    })
  })

  const summary: ValidationSummary = {
    totalRows: rows.length,
    validRows: validatedRows.filter((r) => r.isValid).length,
    rowsWithWarnings: validatedRows.filter((r) =>
      r.validations.some((v) => v.severity === "warning") && r.isValid
    ).length,
    rowsWithErrors: validatedRows.filter((r) => !r.isValid).length,
    errorsByField: countByField(errors),
    warningsByField: countByField(warnings),
  }

  return {
    validRows: validatedRows.filter((r) => r.isValid),
    errorRows: validatedRows.filter((r) => !r.isValid),
    warnings,
    errors,
    summary,
  }
}

function countByField(items: RowValidation[]): Record<string, number> {
  return items.reduce((acc, item) => {
    acc[item.field] = (acc[item.field] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}
