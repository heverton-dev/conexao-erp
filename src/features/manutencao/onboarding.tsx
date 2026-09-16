import { Wrench, Building2, Shield } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const MANUTENCAO_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Wrench className="h-6 w-6 text-[#64748b]" />,
    title: "Painel Global",
    description:
      "Ative ou desative o modo manutenção por módulo em todo o sistema. Disponível apenas para Super Admin.",
  },
  {
    icon: <Building2 className="h-6 w-6 text-[#64748b]" />,
    title: "Painel Empresa",
    description:
      "Gerencie manutenção por empresa. O Admin pode desativar módulos específicos para sua organização.",
  },
  {
    icon: <Shield className="h-6 w-6 text-[#64748b]" />,
    title: "Escopo",
    description:
      "Manutenção global afeta todos os sistemas. Manutenção por empresa afeta apenas a organização selecionada.",
  },
]
