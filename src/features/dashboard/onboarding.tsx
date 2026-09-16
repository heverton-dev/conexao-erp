import { BarChart3, Navigation, Zap } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const DASHBOARD_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <BarChart3 className="h-6 w-6 text-[#0ea5e9]" />,
    title: "KPIs",
    description:
      "Visão geral com métricas principais do sistema. Acompanhe indicadores de todos os módulos em um só lugar.",
  },
  {
    icon: <Navigation className="h-6 w-6 text-[#0ea5e9]" />,
    title: "Navegação",
    description:
      "Use o menu lateral para acessar todos os módulos. Itens disponíveis dependem das suas permissões.",
  },
  {
    icon: <Zap className="h-6 w-6 text-[#0ea5e9]" />,
    title: "Atalhos",
    description:
      "Acesse funcionalidades frequentes rapidamente. Links diretos para as ações mais usadas no dia a dia.",
  },
]
