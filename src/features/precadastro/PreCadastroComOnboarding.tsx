import React from "react"
import { HelpCircle } from "lucide-react"
import { WalkthroughDialog } from "~/core/onboarding/WalkthroughDialog"
import { useWalkthrough } from "~/core/onboarding/useWalkthrough"
import { PRE_CADASTRO_ONBOARDING_STEPS } from "./onboarding"

export function PreCadastroComOnboarding({ children }: { children: React.ReactNode }) {
  const { open, setOpen, dismiss, reopen } = useWalkthrough("pre-cadastro")

  return (
    <>
      {children}
      <button
        onClick={reopen}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#3b82f6] text-white shadow-lg hover:scale-110 transition-all flex items-center justify-center"
        title="Ajuda - Tour guiado"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <WalkthroughDialog
        open={open}
        onOpenChange={setOpen}
        steps={PRE_CADASTRO_ONBOARDING_STEPS}
        onDismiss={dismiss}
      />
    </>
  )
}
