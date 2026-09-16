import { BarChart3, User, Link2, Building2, Palette } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const LINKTREE_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <BarChart3 className="h-6 w-6 text-[#a855f7]" />,
    title: "Dashboard",
    description:
      "Analytics de cliques e engajamento dos links. Veja quais links são mais acessados e por quem.",
  },
  {
    icon: <User className="h-6 w-6 text-[#a855f7]" />,
    title: "Cartões Digitais",
    description:
      "Crie cartões de visita digitais para colaboradores. Cada um gera um QR Code e link personalizado.",
  },
  {
    icon: <Link2 className="h-6 w-6 text-[#a855f7]" />,
    title: "Links",
    description:
      "Adicione e organize links com ícones personalizados. Defina ordem, seções e visibilidade de cada link.",
  },
  {
    icon: <Building2 className="h-6 w-6 text-[#a855f7]" />,
    title: "Linktree Empresa",
    description:
      "Gerencie os links institucionais da empresa. Mantenha informações de contato e redes sociais atualizadas.",
  },
  {
    icon: <Palette className="h-6 w-6 text-[#a855f7]" />,
    title: "Tema",
    description:
      "Personalize cores, fontes e aparência do linktree. Configure tema claro ou escuro com cores da marca.",
  },
]
