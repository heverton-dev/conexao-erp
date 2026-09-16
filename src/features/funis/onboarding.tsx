import { LayoutDashboard, Plus, CreditCard, Repeat, FileText, Share2 } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const FUNIS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <LayoutDashboard className="h-6 w-6 text-[#ec4899]" />,
    title: "Dashboard",
    description:
      "Visão geral dos funis ativos, métricas de conversão e atividade recente. Acompanhe o desempenho de cada funil.",
  },
  {
    icon: <Plus className="h-6 w-6 text-[#ec4899]" />,
    title: "Criar Funil",
    description:
      "Monte colunas Kanban com estágios do seu fluxo. Defina limites WIP e ordem das colunas por arrasto.",
  },
  {
    icon: <CreditCard className="h-6 w-6 text-[#ec4899]" />,
    title: "Task Cards",
    description:
      "Cards com comentários, anexos, labels coloridos e responsável. Mova cards entre colunas por drag and drop.",
  },
  {
    icon: <Repeat className="h-6 w-6 text-[#ec4899]" />,
    title: "Automações",
    description:
      "Regras automáticas: mover card ao concluir, notificar responsável, atribuir ao entrar em estágio específico.",
  },
  {
    icon: <FileText className="h-6 w-6 text-[#ec4899]" />,
    title: "Templates",
    description:
      "Crie funis a partir de templates reutilizáveis. Economize tempo replicando estruturas comprovadas.",
  },
  {
    icon: <Share2 className="h-6 w-6 text-[#ec4899]" />,
    title: "Compartilhar",
    description:
      "Compartilhe funis com membros da equipe. Controle quem pode visualizar e editar cada funil.",
  },
]
