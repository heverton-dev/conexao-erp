import { RotateCcw, Save } from "lucide-react"
import type { useColumnMapper } from "../../hooks/useColumnMapper"
import type { ImportType } from "../../types"
import { IMPORT_FIELD_CONFIGS } from "../../constants"

interface StepMapColumnsProps {
  columnMapper: ReturnType<typeof useColumnMapper>
  fileHeaders: string[]
  previewRows: Record<string, unknown>[]
}

export function StepMapColumns({ columnMapper, fileHeaders, previewRows }: StepMapColumnsProps) {
  const { mappings, updateMapping, resetMappings, getFieldOptions, getAvailableSourceColumns } = columnMapper
  const fieldOptions = getFieldOptions()
  const availableColumns = getAvailableSourceColumns()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">
          Mapeie as colunas do arquivo para os campos do catalogo:
        </p>
        <button
          onClick={resetMappings}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60"
        >
          <RotateCcw size={12} />
          Resetar
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {fieldOptions.map((field) => {
          const mapping = mappings.find((m) => m.targetField === field.value)

          return (
            <div key={field.value} className="flex items-center gap-3">
              <div className="w-1/3">
                <label className="text-xs text-white/40 uppercase tracking-wider">
                  {field.label}
                  {field.required && <span className="text-amber-400 ml-1">*</span>}
                </label>
              </div>

              <div className="w-2/3">
                <select
                  value={mapping?.sourceColumn ?? ""}
                  onChange={(e) => updateMapping(field.value, e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="" className="bg-[#0f172a]">(ignorar)</option>
                  {fileHeaders.map((header) => (
                    <option key={header} value={header} className="bg-[#0f172a]">
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}

        {availableColumns.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/30 mb-2">Colunas nao mapeadas:</p>
            <div className="flex flex-wrap gap-1">
              {availableColumns.map((header) => (
                <span
                  key={header}
                  className="px-2 py-0.5 rounded bg-white/5 text-xs text-white/30"
                >
                  {header}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {previewRows.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Preview (primeiras 5 linhas mapeadas):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {fieldOptions
                    .filter((f) => mappings.some((m) => m.targetField === f.value && m.sourceColumn))
                    .map((field) => (
                      <th key={field.value} className="px-2 py-1 text-left text-white/40 font-medium">
                        {field.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {fieldOptions
                      .filter((f) => mappings.some((m) => m.targetField === f.value && m.sourceColumn))
                      .map((field) => (
                        <td key={field.value} className="px-2 py-1 text-white/60">
                          {row[field.value] !== null && row[field.value] !== undefined
                            ? String(row[field.value])
                            : "—"}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
