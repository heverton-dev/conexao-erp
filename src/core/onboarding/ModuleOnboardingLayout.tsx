import React from "react"
import { HelpCircle } from "lucide-react"
import { WalkthroughDialog } from "./WalkthroughDialog"
import { useWalkthrough } from "./useWalkthrough"
import type { WalkthroughStep } from "./WalkthroughDialog"

interface Props {
  moduleKey: string
  steps: WalkthroughStep[]
  accentColor?: string
  children: React.ReactNode
}

export function ModuleOnboardingLayout({ moduleKey, steps, accentColor = "#c9a655", children }: Props) {
  const { open, setOpen, dismiss, reopen } = useWalkthrough(moduleKey)

  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

      <button
        onClick={reopen}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full text-white shadow-lg hover:scale-110 transition-all flex items-center justify-center"
        style={{ backgroundColor: accentColor }}
        title="Ajuda - Tour guiado"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <WalkthroughDialog
        open={open}
        onOpenChange={setOpen}
        steps={steps}
        onDismiss={dismiss}
      />
    </div>
  )
}
