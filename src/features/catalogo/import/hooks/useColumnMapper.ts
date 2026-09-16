import { useState, useCallback, useEffect } from "react"
import type { ColumnMapping, ImportType } from "../types"
import { autoDetectMappings, applyMapping } from "../engine/mapper"
import { IMPORT_FIELD_CONFIGS } from "../constants"

export function useColumnMapper(
  fileHeaders: string[],
  importType: ImportType | null,
  initialMappings?: ColumnMapping[]
) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([])

  useEffect(() => {
    if (importType && fileHeaders.length > 0) {
      if (initialMappings && initialMappings.length > 0) {
        setMappings(initialMappings)
      } else {
        const detected = autoDetectMappings(fileHeaders, importType)
        setMappings(detected)
      }
    }
  }, [fileHeaders, importType, initialMappings])

  const updateMapping = useCallback((targetField: string, sourceColumn: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.targetField === targetField ? { ...m, sourceColumn } : m
      )
    )
  }, [])

  const resetMappings = useCallback(() => {
    if (importType && fileHeaders.length > 0) {
      setMappings(autoDetectMappings(fileHeaders, importType))
    }
  }, [fileHeaders, importType])

  const setMappingDirect = useCallback((newMappings: ColumnMapping[]) => {
    setMappings(newMappings)
  }, [])

  const getMappedData = useCallback((rows: Record<string, unknown>[]) => {
    return applyMapping(rows, mappings)
  }, [mappings])

  const getAvailableSourceColumns = useCallback(() => {
    const mappedSources = new Set(mappings.filter((m) => m.sourceColumn).map((m) => m.sourceColumn))
    return fileHeaders.filter((h) => !mappedSources.has(h))
  }, [fileHeaders, mappings])

  const getFieldOptions = useCallback(() => {
    if (!importType) return []
    const config = IMPORT_FIELD_CONFIGS[importType]
    return config.targetFields.map((f) => ({
      value: f.key,
      label: f.label,
      required: f.required,
    }))
  }, [importType])

  const requiredFieldsMet = useCallback(() => {
    if (!importType) return false
    const config = IMPORT_FIELD_CONFIGS[importType]
    const requiredFields = config.targetFields.filter((f) => f.required)
    return requiredFields.every((f) =>
      mappings.some((m) => m.targetField === f.key && m.sourceColumn)
    )
  }, [mappings, importType])

  return {
    mappings,
    updateMapping,
    resetMappings,
    setMappingDirect,
    getMappedData,
    getAvailableSourceColumns,
    getFieldOptions,
    requiredFieldsMet,
  }
}
