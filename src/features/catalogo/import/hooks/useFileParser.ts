import { useState, useCallback } from "react"
import type { ParsedFile, ImportType } from "../types"
import { parseImportFile, autoDetectImportType } from "../engine/parser"

export function useFileParser() {
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedType, setDetectedType] = useState<ImportType | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null)

  const parseFile = useCallback(async (file: File) => {
    setIsParsing(true)
    setError(null)

    try {
      if (file.size > 10 * 1024 * 1024) {
        setError("Arquivo muito grande. Maximo: 10MB")
        return
      }

      const parsed = await parseImportFile(file)
      setParsedFile(parsed)

      if (parsed.sheets.length === 0 || parsed.sheets.every((s) => s.totalRows === 0)) {
        setError("Arquivo vazio ou sem dados validos")
        return
      }

      const firstSheet = parsed.sheets[0]
      setSelectedSheet(firstSheet.name)

      const detected = autoDetectImportType(firstSheet.headers)
      setDetectedType(detected)
    } catch (err) {
      setError(`Erro ao ler arquivo: ${err instanceof Error ? err.message : "Desconhecido"}`)
    } finally {
      setIsParsing(false)
    }
  }, [])

  const clearFile = useCallback(() => {
    setParsedFile(null)
    setError(null)
    setDetectedType(null)
    setSelectedSheet(null)
  }, [])

  const getSelectedSheetData = useCallback(() => {
    if (!parsedFile || !selectedSheet) return null
    return parsedFile.sheets.find((s) => s.name === selectedSheet) ?? null
  }, [parsedFile, selectedSheet])

  return {
    parsedFile,
    isParsing,
    error,
    detectedType,
    selectedSheet,
    setSelectedSheet,
    parseFile,
    clearFile,
    getSelectedSheetData,
  }
}
