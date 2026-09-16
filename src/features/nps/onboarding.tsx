import { BarChart3, HelpCircle, Eye, Mail, AlertTriangle } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const NPS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <BarChart3 className="h-6 w-6 text-[#8b5cf6]" />,
    title: "Dashboard",
    description:
      "Visão geral do NPS da empresa com gráficos de tendência, distribuição de notas e evolução ao longo do tempo.",
  },
  {
    icon: <HelpCircle className="h-6 w-6 text-[#8b5cf6]" />,
    title: "Pesquisas",
    description:
      "Crie e gerencie perguntas NPS. Tipos disponíveis: escala 0-10, escolha única, múltipla escolha e texto livre.",
  },
  {
    icon: <Eye className="h-6 w-6 text-[#8b5cf6]" />,
    title: "Preview",
    description:
      "Visualize a pesquisa exatamente como o cliente verá antes de enviar. Verifique layout, perguntas e ordenação.",
  },
  {
    icon: <Mail className="h-6 w-6 text-[#8b5cf6]" />,
    title: "Relatórios",
    description:
      "Acompanhe entregas, respostas recebidas e taxa de resposta. Filtre por período e status de entrega.",
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-[#8b5cf6]" />,
    title: "Detractores",
    description:
      "Identifique automaticamente clientes insatisfeitos com NPS ≤ 6. Aja rapidamente para reter e resolver problemas.",
  },
]
