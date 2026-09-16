import { Map, Users, Settings, Lightbulb } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const MAPAS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Map className="h-6 w-6 text-[#06b6d4]" />,
    title: "Mapa de Distribuidores",
    description:
      "Visualize distribuidores por estado no mapa do Brasil. Clique em um estado para ver detalhes e distribuidores.",
  },
  {
    icon: <Users className="h-6 w-6 text-[#06b6d4]" />,
    title: "Mapa de Consultores",
    description:
      "Localize consultores geograficamente. Veja cobertura por região e identifique áreas sem presença.",
  },
  {
    icon: <Settings className="h-6 w-6 text-[#06b6d4]" />,
    title: "Gestão",
    description:
      "Gerencie distribuidores e consultores cadastrados. Adicione, edite ou remova entidades do mapa.",
  },
  {
    icon: <Lightbulb className="h-6 w-6 text-[#06b6d4]" />,
    title: "Insights",
    description:
      "Análise de presença comercial e cobertura. Identifique oportunidades e lacunas no mapa de atuação.",
  },
]
