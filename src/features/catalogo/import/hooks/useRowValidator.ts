import { useState, useEffect, useRef } from "react"
import type { ImportType, ValidationResult, ValidatedRow } from "../types"
import { validateRows, loadValidationCache, type ValidationCache } from "../engine/validator"

interface UseRowValidatorParams {
  importType: ImportType | null
  rows: Record<string, unknown>[]
  enabled: boolean
}

export function useRowValidator({ importType, rows, enabled }: UseRowValidatorParams) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const cacheRef = useRef<ValidationCache | null>(null)

  useEffect(() => {
    if (!enabled || !importType || rows.length === 0) {
      setValidationResult(null)
      return
    }

    let cancelled = false

    async function validate() {
      setIsValidating(true)

      try {
        cacheRef.current = await loadValidationCache(importType!, rows)
      } catch {
        // segue sem cache — validação estrutural ainda funciona
      }

      if (cancelled) return

      const result = validateRows({
        importType: importType!,
        rows,
        cache: cacheRef.current ?? undefined,
      })

      if (!cancelled) {
        setValidationResult(result)
        setIsValidating(false)
      }
    }

    validate()

    return () => {
      cancelled = true
    }
  }, [importType, rows, enabled])

  const revalidate = (editedRows: Map<number, Record<string, unknown>>) => {
    if (!importType || rows.length === 0) return

    const finalRows = rows.map((row, index) => {
      const edited = editedRows.get(index)
      return edited ? { ...row, ...edited } : row
    })

    const result = validateRows({
      importType,
      rows: finalRows,
      cache: cacheRef.current ?? undefined,
    })

    setValidationResult(result)
  }

  const getValidRows = (): ValidatedRow[] => {
    return validationResult?.validRows ?? []
  }

  const getErrorRows = (): ValidatedRow[] => {
    return validationResult?.errorRows ?? []
  }

  return {
    validationResult,
    isValidating,
    revalidate,
    getValidRows,
    getErrorRows,
  }
}
