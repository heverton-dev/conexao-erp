import { LayoutDashboard, ClipboardList, CheckCircle, Users, Link2, BarChart3 } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const CADASTROS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <LayoutDashboard className="h-6 w-6 text-[#3b82f6]" />,
    title: "Dashboard",
    description:
      "Acompanhe os KPIs do pipeline de cadastros: total, pendentes, aprovados e taxa de aprovação. O painel atualiza em tempo real.",
  },
  {
    icon: <ClipboardList className="h-6 w-6 text-[#3b82f6]" />,
    title: "Solicitações",
    description:
      "Gerencie o pipeline de cadastro: link_gerado → dados_enviados → em_analise → aprovado/reprovado. Filtre por status e data.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-[#3b82f6]" />,
    title: "Aprovação",
    description:
      "Aprove, reprova ou solicite correção de cadastros e documentos. A análise é feita campo a campo para maior precisão.",
  },
  {
    icon: <Users className="h-6 w-6 text-[#3b82f6]" />,
    title: "Clientes",
    description:
      "Lista de clientes aprovados com dados completos. Acesse detalhes, documentos e histórico de cada cliente.",
  },
  {
    icon: <Link2 className="h-6 w-6 text-[#3b82f6]" />,
    title: "Gerar Links",
    description:
      "Crie links de pré-cadastro personalizados para novos leads. O link direciona para o formulário público de cadastro.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-[#3b82f6]" />,
    title: "Relatórios",
    description:
      "Acompanhe métricas detalhadas: tempo médio de aprovação, taxa de reprovação e desempenho do pipeline.",
  },
]
