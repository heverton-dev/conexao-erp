import { Receipt, Send, CheckCircle, BarChart3, Settings } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const DESPESAS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Receipt className="h-6 w-6 text-[#f97316]" />,
    title: "Lançar Despesa",
    description:
      "Registre despesas com tipo, valor, data, descrição e comprovante. Cada despesa é vinculada a um período.",
  },
  {
    icon: <Send className="h-6 w-6 text-[#f97316]" />,
    title: "Enviar para Aprovação",
    description:
      "Submeta suas despesas ao responsável. Após o envio, não é mais possível editar — apenas o responsável pode alterar.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-[#f97316]" />,
    title: "Aprovação",
    description:
      "Aprove ou reprove despesas da equipe. Adicione observações ao reprovar para que o colaborador corrija.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-[#f97316]" />,
    title: "Relatórios",
    description:
      "Acompanhe gastos por período, tipo de despesa e colaborador. Exporte dados para análise externa.",
  },
  {
    icon: <Settings className="h-6 w-6 text-[#f97316]" />,
    title: "Configuração",
    description:
      "Defina tipos de despesa, períodos de pagamento e regras de aprovação. Configure quem pode aprovar.",
  },
]
