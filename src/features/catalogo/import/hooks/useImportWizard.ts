import { useState, useCallback } from "react"
import type { ImportType, ImportWizardState, ColumnMapping, ValidationResult, ParsedFile } from "../types"

const STORAGE_KEY = "catalogo-import-mappings"

function loadSavedMappings(): ImportWizardState["savedMappings"] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMapping(template: ImportWizardState["savedMappings"][0]): void {
  const existing = loadSavedMappings()
  const filtered = existing.filter((m) => m.id !== template.id)
  filtered.push(template)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

function deleteMapping(id: string): void {
  const existing = loadSavedMappings().filter((m) => m.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

function initialProgress(): ImportWizardState["progress"] {
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

export function useImportWizard() {
  const [state, setState] = useState<ImportWizardState>({
    importType: null,
    file: null,
    selectedSheet: null,
    mappings: [],
    validation: null,
    editedRows: new Map(),
    progress: initialProgress(),
    savedMappings: loadSavedMappings(),
  })

  const [currentStep, setCurrentStep] = useState(0)

  const setImportType = useCallback((type: ImportType) => {
    setState((s) => ({ ...s, importType: type }))
    setCurrentStep(1)
  }, [])

  const setFile = useCallback((file: ParsedFile, sheetName: string) => {
    setState((s) => ({ ...s, file, selectedSheet: sheetName }))
  }, [])

  const setMappings = useCallback((mappings: ColumnMapping[]) => {
    setState((s) => ({ ...s, mappings }))
  }, [])

  const setValidation = useCallback((validation: ValidationResult) => {
    setState((s) => ({ ...s, validation }))
  }, [])

  const editRow = useCallback((rowIndex: number, field: string, value: unknown) => {
    setState((s) => {
      const newEdited = new Map(s.editedRows)
      const existing = newEdited.get(rowIndex) ?? {}
      newEdited.set(rowIndex, { ...existing, [field]: value })
      return { ...s, editedRows: newEdited }
    })
  }, [])

  const saveCurrentMapping = useCallback((name: string) => {
    if (!state.importType || state.mappings.length === 0) return
    const template = {
      id: `${state.importType}-${Date.now()}`,
      name,
      importType: state.importType,
      mappings: state.mappings,
      createdAt: new Date().toISOString(),
    }
    saveMapping(template)
    setState((s) => ({ ...s, savedMappings: loadSavedMappings() }))
  }, [state.importType, state.mappings])

  const loadMapping = useCallback((templateId: string) => {
    const template = state.savedMappings.find((m) => m.id === templateId)
    if (template) {
      setState((s) => ({ ...s, mappings: template.mappings }))
    }
  }, [state.savedMappings])

  const deleteMappingById = useCallback((templateId: string) => {
    deleteMapping(templateId)
    setState((s) => ({ ...s, savedMappings: loadSavedMappings() }))
  }, [])

  const setProgress = useCallback((progress: ImportWizardState["progress"]) => {
    setState((s) => ({ ...s, progress }))
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 4))
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, 4)))
  }, [])

  const reset = useCallback(() => {
    setState({
      importType: null,
      file: null,
      selectedSheet: null,
      mappings: [],
      validation: null,
      editedRows: new Map(),
      progress: initialProgress(),
      savedMappings: loadSavedMappings(),
    })
    setCurrentStep(0)
  }, [])

  return {
    state,
    currentStep,
    setImportType,
    setFile,
    setMappings,
    setValidation,
    editRow,
    saveCurrentMapping,
    loadMapping,
    deleteMappingById,
    setProgress,
    nextStep,
    prevStep,
    goToStep,
    reset,
  }
}
