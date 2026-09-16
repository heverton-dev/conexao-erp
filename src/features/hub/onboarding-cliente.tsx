import { BookOpen, Trophy, Award, Star } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const HUB_CLIENTE_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <BookOpen className="h-6 w-6 text-[#f59e0b]" />,
    title: "Materiais",
    description:
      "Navegue pelos conteúdos disponíveis: documentos, vídeos e trilhas de aprendizado organizados para você.",
  },
  {
    icon: <Trophy className="h-6 w-6 text-[#f59e0b]" />,
    title: "Progresso",
    description:
      "Acompanhe seu nível e XP acumulado. Quanto mais materiais você acessa, mais pontos ganha.",
  },
  {
    icon: <Award className="h-6 w-6 text-[#f59e0b]" />,
    title: "Conquistas",
    description:
      "Desbloqueie badges completando trilhas de aprendizado. Cada conquista reforça seu progresso.",
  },
  {
    icon: <Star className="h-6 w-6 text-[#f59e0b]" />,
    title: "Ranking",
    description:
      "Veja sua posição no ranking de participação. Compita de forma saudável com outros colaboradores.",
  },
]
