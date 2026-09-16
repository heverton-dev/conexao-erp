import { Map, MapPin, Truck, ClipboardCheck } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const ROTAS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Map className="h-6 w-6 text-[#14b8a6]" />,
    title: "Planejar Rota",
    description:
      "Crie rotas adicionando paradas em clientes. Defina a ordem de visita e visualize no mapa.",
  },
  {
    icon: <MapPin className="h-6 w-6 text-[#14b8a6]" />,
    title: "Detalhe da Rota",
    description:
      "Veja a lista de clientes, distances e horários estimados de cada parada. Inclua observações específicas.",
  },
  {
    icon: <Truck className="h-6 w-6 text-[#14b8a6]" />,
    title: "Executar",
    description:
      "Inicie a rota em campo. Marque conclusão de cada parada e registre o tempo real de visita.",
  },
  {
    icon: <ClipboardCheck className="h-6 w-6 text-[#14b8a6]" />,
    title: "Pós-Visita",
    description:
      "Preencha o formulário pós-visita com observações, fotos e feedback do cliente. Dados alimentam os relatórios.",
  },
]
