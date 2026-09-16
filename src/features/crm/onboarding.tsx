import { LayoutDashboard, Columns, Thermometer, CheckSquare, Users, TrendingUp } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const CRM_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <LayoutDashboard className="h-6 w-6 text-[#10b981]" />,
    title: "Dashboard",
    description:
      "Visão geral adaptada ao seu perfil: consultor vê sua carteira, gestor vê a equipe, diretor vê métricas consolidadas.",
  },
  {
    icon: <Columns className="h-6 w-6 text-[#10b981]" />,
    title: "Pipeline",
    description:
      "Kanban de vendas com estágios: Prospecção → Qualificação → Proposta → Fechamento. Arraste cards entre colunas.",
  },
  {
    icon: <Thermometer className="h-6 w-6 text-[#10b981]" />,
    title: "Carteira",
    description:
      "Portfólio de clientes por temperatura: Frio (novo contato), Morno (engajado), Quente (próximo do fechamento).",
  },
  {
    icon: <CheckSquare className="h-6 w-6 text-[#10b981]" />,
    title: "Tarefas",
    description:
      "Gerencie atividades e follow-ups com clientes. Crie tarefas com prazo, prioridade e vinculação ao cliente.",
  },
  {
    icon: <Users className="h-6 w-6 text-[#10b981]" />,
    title: "Equipe",
    description:
      "Convide consultores por email e gerencie a equipe comercial. Defina gestores e transfira clientes entre consultores.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-[#10b981]" />,
    title: "BI",
    description:
      "Análise de funil, taxa de conversão e métricas avançadas de vendas. Dashboards interativos para tomada de decisão.",
  },
]
