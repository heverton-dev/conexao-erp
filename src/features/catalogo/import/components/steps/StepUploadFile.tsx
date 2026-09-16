import { Upload, AlertCircle } from "lucide-react"
import type { useFileParser } from "../../hooks/useFileParser"
import type { ImportType } from "../../types"
import { IMPORT_FIELD_CONFIGS } from "../../constants"

interface StepUploadFileProps {
  fileParser: ReturnType<typeof useFileParser>
  importType: ImportType
}

export function StepUploadFile({ fileParser, importType }: StepUploadFileProps) {
  const { parsedFile, isParsing, error, selectedSheet, setSelectedSheet, parseFile } = fileParser

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        {IMPORT_FIELD_CONFIGS[importType].description}
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-white/20 hover:border-amber-500/50 transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          id="import-file-input"
          onChange={handleFileChange}
        />
        <label htmlFor="import-file-input" className="flex flex-col items-center cursor-pointer">
          {isParsing ? (
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={24} className="text-white/30 mb-2" />
          )}
          <span className="text-sm text-white/40">
            {isParsing ? "Processando..." : "Arraste ou clique para selecionar"}
          </span>
          <span className="text-xs text-white/20 mt-1">
            .xlsx, .xls, .csv (max 10MB)
          </span>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {parsedFile && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{parsedFile.fileName}</p>
              <p className="text-xs text-white/40">
                {(parsedFile.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {parsedFile.sheets.length > 1 && (
            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase tracking-wider">
                Selecionar aba:
              </label>
              <select
                value={selectedSheet ?? ""}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                {parsedFile.sheets.map((sheet) => (
                  <option key={sheet.name} value={sheet.name} className="bg-[#0f172a]">
                    {sheet.name} ({sheet.totalRows} linhas)
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSheet && (
            <div className="text-sm text-white/60">
              Linhas detectadas:{" "}
              <span className="text-white font-medium">
                {parsedFile.sheets.find((s) => s.name === selectedSheet)?.totalRows ?? 0}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
