import { useState } from "react"
import { AlertCircle, AlertTriangle, CheckCircle, Filter } from "lucide-react"
import type { ValidationResult, ImportType } from "../../types"
import { IMPORT_FIELD_CONFIGS } from "../../constants"

interface StepValidatePreviewProps {
  validationResult: ValidationResult | null
  isValidating: boolean
  editedRows: Map<number, Record<string, unknown>>
  onEditRow: (rowIndex: number, field: string, value: unknown) => void
  fileHeaders: string[]
  importType: ImportType
}

type FilterType = "all" | "valid" | "errors" | "warnings"

export function StepValidatePreview({
  validationResult,
  isValidating,
  editedRows,
  onEditRow,
  fileHeaders,
  importType,
}: StepValidatePreviewProps) {
  const [filter, setFilter] = useState<FilterType>("all")
  const [editingCell, setEditingCell] = useState<{ row: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")

  const config = IMPORT_FIELD_CONFIGS[importType]

  const allRows = validationResult
    ? [...validationResult.validRows, ...validationResult.errorRows].sort((a, b) => a.rowIndex - b.rowIndex)
    : []

  const filteredRows = allRows.filter((row) => {
    if (filter === "valid") return row.isValid
    if (filter === "errors") return !row.isValid
    if (filter === "warnings") return row.validations.some((v) => v.severity === "warning") && row.isValid
    return true
  })

  const startEdit = (rowIndex: number, field: string, currentValue: unknown) => {
    setEditingCell({ row: rowIndex, field })
    setEditValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : "")
  }

  const saveEdit = () => {
    if (editingCell) {
      onEditRow(editingCell.row, editingCell.field, editValue)
      setEditingCell(null)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
  }

  const getRowStatus = (row: typeof allRows[0]) => {
    if (!row.isValid) return "error"
    if (row.validations.some((v) => v.severity === "warning")) return "warning"
    return "valid"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "error": return <AlertCircle size={14} className="text-red-400" />
      case "warning": return <AlertTriangle size={14} className="text-yellow-400" />
      default: return <CheckCircle size={14} className="text-emerald-400" />
    }
  }

  const mappedFields = config.targetFields.filter((f) =>
    validationResult?.validRows[0]?.data[f.key] !== undefined ||
    validationResult?.errorRows[0]?.data[f.key] !== undefined
  )

  return (
    <div className="space-y-4">
      {isValidating ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-white/60">Validando dados...</span>
        </div>
      ) : validationResult ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">
                <span className="text-emerald-400 font-medium">{validationResult.summary.validRows}</span> validos
              </span>
              {validationResult.summary.rowsWithErrors > 0 && (
                <span className="text-sm">
                  <span className="text-red-400 font-medium">{validationResult.summary.rowsWithErrors}</span> com erro
                </span>
              )}
              {validationResult.summary.rowsWithWarnings > 0 && (
                <span className="text-sm">
                  <span className="text-yellow-400 font-medium">{validationResult.summary.rowsWithWarnings}</span> com aviso
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {(["all", "valid", "errors", "warnings"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 rounded text-xs ${
                    filter === f
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "valid" ? "Validos" : f === "errors" ? "Erros" : "Avisos"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto max-h-[400px] border border-white/10 rounded-lg">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#0f172a]">
                <tr className="border-b border-white/10">
                  <th className="px-2 py-2 text-left text-white/40 font-medium w-8">#</th>
                  <th className="px-2 py-2 text-left text-white/40 font-medium w-8">Status</th>
                  {mappedFields.map((field) => (
                    <th key={field.key} className="px-2 py-2 text-left text-white/40 font-medium">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const status = getRowStatus(row)
                  const edited = editedRows.get(row.rowIndex)

                  return (
                    <tr
                      key={row.rowIndex}
                      className={`border-b border-white/5 ${
                        status === "error" ? "bg-red-500/5" : status === "warning" ? "bg-yellow-500/5" : ""
                      }`}
                    >
                      <td className="px-2 py-1.5 text-white/30">{row.rowIndex + 1}</td>
                      <td className="px-2 py-1.5">{getStatusIcon(status)}</td>
                      {mappedFields.map((field) => {
                        const cellValue = edited?.[field.key] ?? row.data[field.key]
                        const isEditing = editingCell?.row === row.rowIndex && editingCell?.field === field.key
                        const hasError = row.validations.some(
                          (v) => v.field === field.key && v.severity === "error"
                        )

                        return (
                          <td
                            key={field.key}
                            className={`px-2 py-1.5 ${
                              hasError ? "text-red-400" : "text-white/60"
                            } ${isEditing ? "bg-white/5" : ""}`}
                            onDoubleClick={() => startEdit(row.rowIndex, field.key, cellValue)}
                          >
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                onBlur={saveEdit}
                                className="w-full px-1 py-0.5 bg-white/10 border border-amber-500/50 rounded text-white text-xs"
                              />
                            ) : (
                              <span title={row.validations.find((v) => v.field === field.key)?.message}>
                                {cellValue !== null && cellValue !== undefined ? String(cellValue) : "—"}
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Erros encontrados:</p>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {validationResult.errors.slice(0, 20).map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                    <span className="text-red-400">
                      Linha {err.rowIndex + 1}: {err.message}
                    </span>
                  </div>
                ))}
                {validationResult.errors.length > 20 && (
                  <p className="text-xs text-white/30">
                    ... e mais {validationResult.errors.length - 20} erros
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-white/30">
            Duplo-clique em qualquer celula para editar. Enter para salvar, Esc para cancelar.
          </p>
        </>
      ) : (
        <div className="text-center py-8 text-sm text-white/40">
          Faça o upload de um arquivo e mapeie as colunas primeiro.
        </div>
      )}
    </div>
  )
}
