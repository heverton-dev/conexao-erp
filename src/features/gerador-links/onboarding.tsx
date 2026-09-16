import { MessageSquare, Tag, Star, MapPin, QrCode } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const GERADOR_LINKS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <MessageSquare className="h-6 w-6 text-[#22c55e]" />,
    title: "WhatsApp",
    description:
      "Gere links com mensagem pré-preenchida. O cliente clica e já abre o WhatsApp com sua mensagem pronta para enviar.",
  },
  {
    icon: <Tag className="h-6 w-6 text-[#22c55e]" />,
    title: "UTMs",
    description:
      "Construa parâmetros de rastreamento UTM para campanhas de marketing. Rastreie origem, mídia e campanha.",
  },
  {
    icon: <Star className="h-6 w-6 text-[#22c55e]" />,
    title: "Google Review",
    description:
      "Crie links diretos para pedir avaliações no Google. Compartilhe com clientes satisfeitos para melhorar o ranking.",
  },
  {
    icon: <MapPin className="h-6 w-6 text-[#22c55e]" />,
    title: "Maps & Waze",
    description:
      "Gere links de navegação para seu endereço. Compatível com Google Maps e Waze para facilitar o deslocamento.",
  },
  {
    icon: <QrCode className="h-6 w-6 text-[#22c55e]" />,
    title: "QR Code",
    description:
      "Crie QR codes para qualquer link. Personalize cores e baixe em alta resolução para impressão.",
  },
]
