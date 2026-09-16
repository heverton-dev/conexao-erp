import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { parseImportFile, matchSheetNameToImportType } from "../engine/parser"
import { autoDetectMappings, applyMapping } from "../engine/mapper"
import { loadValidationCache, validateRows } from "../engine/validator"
import { executeImport, createResolverCache } from "../engine/executor"
import { GLOBAL_IMPORT_ORDER, IMPORT_FIELD_CONFIGS } from "../constants"
import type { ImportType, ImportResult } from "../types"

interface GlobalImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Phase = "upload" | "executing" | "done"

interface EntityOutcome {
  type: ImportType
  errorRows: number
  result?: ImportResult
}

export function GlobalImportDialog({ open, onOpenChange }: GlobalImportDialogProps) {
  const [phase, setPhase] = useState<Phase>("upload")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [outcomes, setOutcomes] = useState<EntityOutcome[]>([])
  const [currentLabel, setCurrentLabel] = useState("")

  const handleClose = () => {
    setPhase("upload")
    setFileName("")
    setError(null)
    setOutcomes([])
    setCurrentLabel("")
    onOpenChange(false)
  }

  const handleFile = async (file: File) => {
    setError(null)
    setFileName(file.name)

    let parsed
    try {
      parsed = await parseImportFile(file)
    } catch (err) {
      setError(`Erro ao ler arquivo: ${err instanceof Error ? err.message : "desconhecido"}`)
      return
    }

    setPhase("executing")
    setOutcomes([])
    const cache = createResolverCache()
    const results: EntityOutcome[] = []

    for (const type of GLOBAL_IMPORT_ORDER) {
      const sheet = parsed.sheets.find((s) => matchSheetNameToImportType(s.name) === type)
      if (!sheet || sheet.rows.length === 0) continue

      setCurrentLabel(IMPORT_FIELD_CONFIGS[type].label)

      const mappings = autoDetectMappings(sheet.headers, type)
      const mappedRows = applyMapping(sheet.rows, mappings)

      let validationCache
      try {
        validationCache = await loadValidationCache(type, mappedRows)
      } catch {
        // segue sem cache — validação estrutural ainda funciona
      }
      const validation = validateRows({ importType: type, rows: mappedRows, cache: validationCache })

      let result: ImportResult | undefined
      if (validation.validRows.length > 0) {
        result = await executeImport({
          importType: type,
          validRows: validation.validRows,
          editedRows: new Map(),
          onProgress: () => {},
          cache,
        })
      }

      results.push({ type, errorRows: validation.errorRows.length, result })
      setOutcomes([...results])
    }

    setCurrentLabel("")
    setPhase("done")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const totals = outcomes.reduce(
    (acc, o) => ({
      ok: acc.ok + (o.result ? o.result.inserted + o.result.updated : 0),
      errors: acc.errors + (o.result?.errors.length ?? 0) + o.errorRows,
    }),
    { ok: 0, errors: 0 },
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white flex flex-col max-h-[85vh] overflow-hidden max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-semibold">Importação Global do Catálogo</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0 space-y-4">
          {phase === "upload" && (
            <>
              <p className="text-sm text-white/60">
                Envie 1 arquivo XLSX com uma aba por tipo de dado (baixe o template global se ainda não tiver um).
                As abas preenchidas são processadas automaticamente na ordem correta de dependência.
              </p>
              <div className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-white/20 hover:border-sky-500/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  id="global-import-input"
                  onChange={handleFileChange}
                />
                <label htmlFor="global-import-input" className="flex flex-col items-center cursor-pointer">
                  <Upload size={24} className="text-white/30 mb-2" />
                  <span className="text-sm text-white/40">Arraste ou clique para selecionar</span>
                  <span className="text-xs text-white/20 mt-1">.xlsx com abas por tipo</span>
                </label>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}
            </>
          )}

          {phase === "executing" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-white/60">
                  {currentLabel ? `Processando ${currentLabel}...` : "Finalizando..."}
                </span>
              </div>
              <OutcomeList outcomes={outcomes} />
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-emerald-400" />
                <div>
                  <h3 className="text-lg font-medium">Importação Global Concluída</h3>
                  <p className="text-sm text-white/60">{fileName}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/40">Gravados</p>
                  <p className="text-lg font-medium text-emerald-400">{totals.ok}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/40">Erros</p>
                  <p className="text-lg font-medium text-red-400">{totals.errors}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/40">Abas processadas</p>
                  <p className="text-lg font-medium text-white/60">{outcomes.length}</p>
                </div>
              </div>
              <OutcomeList outcomes={outcomes} />
            </div>
          )}
        </div>

        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-white/10">
          <button onClick={handleClose} className="px-4 py-2 text-sm text-white/60 hover:text-white">
            {phase === "done" ? "Fechar" : "Cancelar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function OutcomeList({ outcomes }: { outcomes: EntityOutcome[] }) {
  if (outcomes.length === 0) return null
  return (
    <div className="space-y-1.5">
      {outcomes.map((o) => {
        const okCount = o.result ? o.result.inserted + o.result.updated : 0
        const errCount = (o.result?.errors.length ?? 0) + o.errorRows
        return (
          <div key={o.type} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-white/5">
            <span className="text-white/70">{IMPORT_FIELD_CONFIGS[o.type].label}</span>
            <span>
              <span className="text-emerald-400">{okCount} ok</span>
              {errCount > 0 && <span className="text-red-400 ml-2">{errCount} erro(s)</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}
