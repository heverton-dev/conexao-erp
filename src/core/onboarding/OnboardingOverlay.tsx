import { useMatches } from "@tanstack/react-router"
import { HelpCircle } from "lucide-react"
import { WalkthroughDialog } from "./WalkthroughDialog"
import { useWalkthrough } from "./useWalkthrough"
import { isOnboardingEnabled } from "~/features/empresas/services/onboarding-config"
import type { WalkthroughStep } from "./WalkthroughDialog"

import { CADASTROS_ONBOARDING_STEPS } from "~/features/cadastros/onboarding"
import { NPS_ONBOARDING_STEPS } from "~/features/nps/onboarding"
import { HUB_ONBOARDING_STEPS } from "~/features/hub/onboarding"
import { CRM_ONBOARDING_STEPS } from "~/features/crm/onboarding"
import { EMPRESAS_ONBOARDING_STEPS } from "~/features/empresas/onboarding"
import { FUNIS_ONBOARDING_STEPS } from "~/features/funis/onboarding"
import { DESPESAS_ONBOARDING_STEPS } from "~/features/despesas/onboarding"
import { ROTAS_ONBOARDING_STEPS } from "~/features/rotas/onboarding"
import { MAPAS_ONBOARDING_STEPS } from "~/features/mapas/onboarding"
import { LINKTREE_ONBOARDING_STEPS } from "~/features/linktree/onboarding"
import { GERADOR_LINKS_ONBOARDING_STEPS } from "~/features/gerador-links/onboarding"
import { MANUTENCAO_ONBOARDING_STEPS } from "~/features/manutencao/onboarding"

interface OnboardingConfig {
  steps: WalkthroughStep[]
  accentColor: string
}

const ROUTE_MODULE_MAP: Record<string, string> = {
  "/cadastros": "cadastros",
  "/nps": "nps",
  "/hub": "hub",
  "/crm": "crm",
  "/empresa": "empresas-core",
  "/funis": "funis",
  "/despesas": "despesas",
  "/rotas": "rotas",
  "/mapas": "mapas-interativos",
  "/linktree": "linktree",
  "/ferramentas/links": "gerador-links",
  "/global/manutencao": "manutencao",
  "/empresa/manutencao": "manutencao",
}

const ONBOARDING_REGISTRY: Record<string, OnboardingConfig> = {
  cadastros: { steps: CADASTROS_ONBOARDING_STEPS, accentColor: "#3b82f6" },
  nps: { steps: NPS_ONBOARDING_STEPS, accentColor: "#8b5cf6" },
  hub: { steps: HUB_ONBOARDING_STEPS, accentColor: "#f59e0b" },
  crm: { steps: CRM_ONBOARDING_STEPS, accentColor: "#10b981" },
  "empresas-core": { steps: EMPRESAS_ONBOARDING_STEPS, accentColor: "#6366f1" },
  funis: { steps: FUNIS_ONBOARDING_STEPS, accentColor: "#ec4899" },
  despesas: { steps: DESPESAS_ONBOARDING_STEPS, accentColor: "#f97316" },
  rotas: { steps: ROTAS_ONBOARDING_STEPS, accentColor: "#14b8a6" },
  "mapas-interativos": { steps: MAPAS_ONBOARDING_STEPS, accentColor: "#06b6d4" },
  linktree: { steps: LINKTREE_ONBOARDING_STEPS, accentColor: "#a855f7" },
  "gerador-links": { steps: GERADOR_LINKS_ONBOARDING_STEPS, accentColor: "#22c55e" },
  manutencao: { steps: MANUTENCAO_ONBOARDING_STEPS, accentColor: "#64748b" },
}

function detectModuleFromPath(pathname: string): string | null {
  const sorted = Object.keys(ROUTE_MODULE_MAP).sort((a, b) => b.length - a.length)
  for (const prefix of sorted) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return ROUTE_MODULE_MAP[prefix]
    }
  }
  return null
}

export function OnboardingOverlay() {
  const matches = useMatches()
  const lastMatch = matches[matches.length - 1]
  const pathname = lastMatch?.pathname || ""

  const moduleKey = detectModuleFromPath(pathname)
  const config = moduleKey ? ONBOARDING_REGISTRY[moduleKey] : null
  const enabled = moduleKey ? isOnboardingEnabled(moduleKey) : false

  const walkthroughKey = moduleKey && config && enabled ? moduleKey : "__none__"
  const walkthroughConfig = config && enabled ? config : null

  const { open, setOpen, dismiss, reopen } = useWalkthrough(walkthroughKey)

  if (!walkthroughConfig) return null

  return (
    <>
      <button
        onClick={reopen}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full text-white shadow-lg hover:scale-110 transition-all flex items-center justify-center"
        style={{ backgroundColor: walkthroughConfig.accentColor }}
        title="Ajuda - Tour guiado"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <WalkthroughDialog
        open={open}
        onOpenChange={setOpen}
        steps={walkthroughConfig.steps}
        onDismiss={dismiss}
      />
    </>
  )
}
