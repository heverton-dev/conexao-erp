import { BookOpen, Route, Award, BarChart3, Bot, TrendingUp, Users } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const HUB_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <BookOpen className="h-6 w-6 text-[#f59e0b]" />,
    title: "Materiais",
    description:
      "Cadastre documentos, vídeos e trilhas de aprendizado. Organize por tipo, tag e dificuldade para facilitar o acesso.",
  },
  {
    icon: <Route className="h-6 w-6 text-[#f59e0b]" />,
    title: "Trilhas",
    description:
      "Organize materiais em sequências de aprendizado progressivas. Defina pré-requisitos e ordem de conclusão.",
  },
  {
    icon: <Award className="h-6 w-6 text-[#f59e0b]" />,
    title: "Badges & Conquistas",
    description:
      "Configure insignias e recompensas para gamificação. Desbloqueie conquistas ao completar trilhas e materiais.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-[#f59e0b]" />,
    title: "Analytics",
    description:
      "Acompanhe engajamento, tempo de estudo e progresso dos colaboradores. Dashboards para admin e gestores.",
  },
  {
    icon: <Bot className="h-6 w-6 text-[#f59e0b]" />,
    title: "Chatbot",
    description:
      "Configure o assistente virtual para tirar dúvidas frequentes sobre materiais e processos da empresa.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-[#f59e0b]" />,
    title: "Ranking",
    description:
      "Veja o ranking de participação e XP dos colaboradores. Incentive a competição saudável com níveis e cores.",
  },
  {
    icon: <Users className="h-6 w-6 text-[#f59e0b]" />,
    title: "Multi-role",
    description:
      "Dashboard adaptado por perfil: Admin gerencia tudo, Gestor vê analytics, Consultor foca em materiais e ranking.",
  },
]
