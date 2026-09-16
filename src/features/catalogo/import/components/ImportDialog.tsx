import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { StepSelectType } from "./steps/StepSelectType"
import { StepUploadFile } from "./steps/StepUploadFile"
import { StepMapColumns } from "./steps/StepMapColumns"
import { StepValidatePreview } from "./steps/StepValidatePreview"
import { StepExecute } from "./steps/StepExecute"
import { useImportWizard } from "../hooks/useImportWizard"
import { useFileParser } from "../hooks/useFileParser"
import { useColumnMapper } from "../hooks/useColumnMapper"
import { useRowValidator } from "../hooks/useRowValidator"
import { useImportExecutor } from "../hooks/useImportExecutor"
import { IMPORT_FIELD_CONFIGS } from "../constants"
import type { ImportType } from "../types"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialType?: ImportType | null
}

const ALL_STEP_LABELS = ["Tipo", "Arquivo", "Mapeamento", "Validação", "Importar"]

export function ImportDialog({ open, onOpenChange, initialType }: ImportDialogProps) {
  const wizard = useImportWizard()
  const fileParser = useFileParser()

  const hasInitialType = !!initialType
  const stepLabels = hasInitialType
    ? ALL_STEP_LABELS.filter((_, i) => i !== 0)
    : ALL_STEP_LABELS
  const stepOffset = hasInitialType ? 1 : 0

  useEffect(() => {
    if (open && initialType) {
      wizard.setImportType(initialType)
    }
  }, [open, initialType]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSheetData = fileParser.getSelectedSheetData()
  const mappedHeaders = selectedSheetData?.headers ?? []
  const mappedRows = selectedSheetData?.rows ?? []

  const columnMapper = useColumnMapper(mappedHeaders, wizard.state.importType)
  const importType = wizard.state.importType
  const mappedData = importType ? columnMapper.getMappedData(mappedRows) : []

  const rowValidator = useRowValidator({
    importType,
    rows: mappedData,
    enabled: wizard.currentStep === 3 && mappedData.length > 0,
  })

  const importExecutor = useImportExecutor({
    onImportComplete: () => {
      // invalidação de queries é feita pela página que abriu o dialog
    },
  })

  const handleClose = () => {
    wizard.reset()
    fileParser.clearFile()
    importExecutor.reset()
    onOpenChange(false)
  }

  const handleNext = () => {
    if (wizard.currentStep === 1 && fileParser.parsedFile && fileParser.selectedSheet) {
      wizard.setFile(fileParser.parsedFile, fileParser.selectedSheet)
    }
    if (wizard.currentStep === 2) {
      wizard.setMappings(columnMapper.mappings)
    }
    if (wizard.currentStep === 3 && rowValidator.validationResult) {
      wizard.setValidation(rowValidator.validationResult)
    }
    wizard.nextStep()
  }

  const handleBack = () => {
    wizard.prevStep()
  }

  const handleEditRow = (rowIndex: number, field: string, value: unknown) => {
    wizard.editRow(rowIndex, field, value)
    const nextEdited = new Map(wizard.state.editedRows)
    nextEdited.set(rowIndex, { ...nextEdited.get(rowIndex), [field]: value })
    rowValidator.revalidate(nextEdited)
  }

  const canProceed = () => {
    switch (wizard.currentStep) {
      case 0: return !!wizard.state.importType
      case 1: return !!fileParser.parsedFile && !fileParser.error
      case 2: return columnMapper.requiredFieldsMet()
      case 3: return !!rowValidator.validationResult && rowValidator.validationResult.validRows.length > 0
      default: return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white flex flex-col max-h-[85vh] overflow-hidden max-w-4xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-semibold">
            Importar {importType ? IMPORT_FIELD_CONFIGS[importType].label : "Catálogo"}
          </DialogTitle>
          <div className="flex gap-1 mt-3">
            {stepLabels.map((label, i) => {
              const realStep = i + stepOffset
              return (
                <div key={label} className="flex items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      realStep === wizard.currentStep
                        ? "bg-amber-500 text-black"
                        : realStep < wizard.currentStep
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/10 text-white/40"
                    }`}
                  >
                    {realStep < wizard.currentStep ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline ${
                      realStep === wizard.currentStep ? "text-amber-400" : "text-white/40"
                    }`}
                  >
                    {label}
                  </span>
                  {i < stepLabels.length - 1 && (
                    <div className={`w-4 h-px ${realStep < wizard.currentStep ? "bg-emerald-500/40" : "bg-white/10"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
          {wizard.currentStep === 0 && (
            <StepSelectType
              selectedType={wizard.state.importType}
              onSelect={wizard.setImportType}
            />
          )}
          {wizard.currentStep === 1 && (
            <StepUploadFile
              fileParser={fileParser}
              importType={wizard.state.importType!}
            />
          )}
          {wizard.currentStep === 2 && (
            <StepMapColumns
              columnMapper={columnMapper}
              fileHeaders={mappedHeaders}
              previewRows={mappedData.slice(0, 5)}
            />
          )}
          {wizard.currentStep === 3 && (
            <StepValidatePreview
              validationResult={rowValidator.validationResult}
              isValidating={rowValidator.isValidating}
              editedRows={wizard.state.editedRows}
              onEditRow={handleEditRow}
              fileHeaders={mappedHeaders}
              importType={wizard.state.importType!}
            />
          )}
          {wizard.currentStep === 4 && (
            <StepExecute
              importType={wizard.state.importType!}
              validRows={rowValidator.getValidRows()}
              editedRows={wizard.state.editedRows}
              executor={importExecutor}
              onComplete={() => {
                // invalidação de queries é feita pela página que abriu o dialog
              }}
            />
          )}
        </div>

        <div className="shrink-0 flex justify-between px-6 py-4 border-t border-white/10">
          <button
            onClick={handleBack}
            disabled={wizard.currentStep === 0}
            className="px-4 py-2 text-sm text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Voltar
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-white/60 hover:text-white"
            >
              Cancelar
            </button>
            {wizard.currentStep < 4 && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 text-sm bg-amber-500 text-black font-medium rounded hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {wizard.currentStep === 3 ? "Importar" : "Próximo"}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
