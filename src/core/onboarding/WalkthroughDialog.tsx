import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { HelpCircle, ChevronRight, ChevronLeft, Check } from "lucide-react"

export interface WalkthroughStep {
  icon?: React.ReactNode
  title: string
  description: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  steps: WalkthroughStep[]
  title?: string
  onDismiss: () => void
}

export function WalkthroughDialog({ open, onOpenChange, steps, title, onDismiss }: Props) {
  const [step, setStep] = useState(0)
  const [dontShow, setDontShow] = useState(false)
  const isLast = step === steps.length - 1

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  function handleClose() {
    if (dontShow) onDismiss()
    onOpenChange(false)
  }

  function handleFinish() {
    if (dontShow) onDismiss()
    onOpenChange(false)
    setStep(0)
  }

  const current = steps[step]

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-white flex items-center gap-2 text-base">
            <HelpCircle className="h-4 w-4 text-[#c9a655]" />
            {title || "Tour guiado"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-[#c9a655]" : "w-2 bg-white/20"}`}
              />
            ))}
          </div>

          <div className="text-center space-y-3">
            {current.icon && (
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#c9a655]/10 border border-[#c9a655]/20 flex items-center justify-center mx-auto">
                  {current.icon}
                </div>
              </div>
            )}
            <h3 className="text-lg font-bold text-white">{current.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">{current.description}</p>
          </div>
        </div>

        <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)] flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <input
                id="dont-show"
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="rounded border-white/20 bg-transparent"
              />
              <label htmlFor="dont-show" className="text-xs text-gray-500 cursor-pointer select-none">
                Não mostrar novamente
              </label>
            </div>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                </button>
              )}
              {isLast ? (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
                >
                  <Check className="h-3.5 w-3.5" /> Concluir
                </button>
              ) : (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
                >
                  Próximo <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
