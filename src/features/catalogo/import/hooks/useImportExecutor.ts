import { useState, useCallback } from "react"
import type { ImportType, ValidatedRow, ImportProgress, ImportResult } from "../types"
import { executeImport, createResolverCache, type ResolverCache } from "../engine/executor"

interface UseImportExecutorParams {
  onImportComplete?: (result: ImportResult) => void
}

function initialProgress(): ImportProgress {
  return {
    status: "idle",
    currentStep: 0,
    totalSteps: 5,
    currentBatch: 0,
    totalBatches: 0,
    processedRows: 0,
    totalRows: 0,
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: [],
    startTime: 0,
  }
}

export function useImportExecutor({ onImportComplete }: UseImportExecutorParams = {}) {
  const [progress, setProgress] = useState<ImportProgress>(initialProgress())
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const execute = useCallback(async (
    importType: ImportType,
    validRows: ValidatedRow[],
    editedRows: Map<number, Record<string, unknown>>,
    cache?: ResolverCache,
  ) => {
    setIsExecuting(true)
    setResult(null)

    setProgress({
      status: "executing",
      currentStep: 4,
      totalSteps: 5,
      currentBatch: 0,
      totalBatches: Math.ceil(validRows.length / 50),
      processedRows: 0,
      totalRows: validRows.length,
      insertedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      startTime: Date.now(),
    })

    try {
      const importResult = await executeImport({
        importType,
        validRows,
        editedRows,
        onProgress: setProgress,
        cache: cache ?? createResolverCache(),
      })

      setProgress((p) => ({ ...p, status: importResult.success ? "completed" : "failed" }))
      setResult(importResult)
      onImportComplete?.(importResult)
    } catch (err) {
      setProgress((p) => ({ ...p, status: "failed" }))
      setResult({
        success: false,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [{ rowIndex: -1, data: {}, error: String(err), errorCode: "UNKNOWN", recoverable: false }],
        duration: 0,
        details: [],
      })
    } finally {
      setIsExecuting(false)
    }
  }, [onImportComplete])

  const reset = useCallback(() => {
    setProgress(initialProgress())
    setResult(null)
    setIsExecuting(false)
  }, [])

  return {
    progress,
    result,
    isExecuting,
    execute,
    reset,
  }
}
