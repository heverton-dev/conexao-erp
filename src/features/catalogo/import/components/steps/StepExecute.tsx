import { useEffect } from "react"
import { CheckCircle, AlertCircle, Download } from "lucide-react"
import type { ImportType, ValidatedRow } from "../../types"
import type { useImportExecutor } from "../../hooks/useImportExecutor"

interface StepExecuteProps {
  importType: ImportType
  validRows: ValidatedRow[]
  editedRows: Map<number, Record<string, unknown>>
  executor: ReturnType<typeof useImportExecutor>
  onComplete: () => void
}

export function StepExecute({
  importType,
  validRows,
  editedRows,
  executor,
  onComplete,
}: StepExecuteProps) {
  const { progress, result, isExecuting, execute } = executor

  useEffect(() => {
    if (validRows.length > 0 && progress.status === "idle") {
      execute(importType, validRows, editedRows)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (progress.status === "completed" || progress.status === "failed") {
      onComplete()
    }
  }, [progress.status, onComplete])

  const downloadLog = () => {
    if (!result) return
    const lines = [
      "Status,Identifier,Entity,Error",
      ...result.details.map((d) =>
        `${d.action},${d.identifier},${d.entity},${d.error ?? ""}`
      ),
      ...result.errors.map((e) =>
        `error,${e.data.sku ?? "unknown"},,${e.error}`
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `import_log_${importType}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (progress.status === "completed" || progress.status === "failed") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {result?.success ? (
            <CheckCircle size={24} className="text-emerald-400" />
          ) : (
            <AlertCircle size={24} className="text-red-400" />
          )}
          <div>
            <h3 className="text-lg font-medium">
              {result?.success ? "Importacao Concluida!" : "Importacao com Erros"}
            </h3>
            <p className="text-sm text-white/60">
              {result?.success
                ? "Todos os dados foram importados com sucesso."
                : "Alguns registros nao puderam ser importados."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-white/40">Inseridos</p>
            <p className="text-lg font-medium text-emerald-400">{result?.inserted ?? 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-white/40">Atualizados</p>
            <p className="text-lg font-medium text-amber-400">{result?.updated ?? 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-white/40">Erros</p>
            <p className="text-lg font-medium text-red-400">{result?.errors.length ?? 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-white/40">Duracao</p>
            <p className="text-lg font-medium text-white/60">
              {result ? `${(result.duration / 1000).toFixed(1)}s` : "—"}
            </p>
          </div>
        </div>

        {result && result.errors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Erros:</p>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {result.errors.slice(0, 20).map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-red-500/5">
                  <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                  <span className="text-red-400">
                    {err.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={downloadLog}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded"
          >
            <Download size={12} />
            Baixar Log
          </button>
        </div>
      </div>
    )
  }

  const percentage = progress.totalRows > 0
    ? Math.round((progress.processedRows / progress.totalRows) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Importando dados...</span>
          <span className="text-white/40">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-white/40">Linhas: </span>
          <span className="text-white">
            {progress.processedRows} / {progress.totalRows}
          </span>
        </div>
        <div>
          <span className="text-white/40">Lotes: </span>
          <span className="text-white">
            {progress.currentBatch} / {progress.totalBatches}
          </span>
        </div>
        <div>
          <span className="text-white/40">Inseridos: </span>
          <span className="text-emerald-400">{progress.insertedCount}</span>
        </div>
        <div>
          <span className="text-white/40">Erros: </span>
          <span className={progress.errorCount > 0 ? "text-red-400" : "text-white"}>
            {progress.errorCount}
          </span>
        </div>
      </div>

      {progress.estimatedTimeRemaining !== undefined && progress.estimatedTimeRemaining > 0 && (
        <p className="text-xs text-white/30">
          Tempo estimado: ~{progress.estimatedTimeRemaining}s restantes
        </p>
      )}

      {progress.errors.length > 0 && (
        <div className="text-xs text-red-400">
          Ultimo erro: {progress.errors[progress.errors.length - 1].error}
        </div>
      )}
    </div>
  )
}
