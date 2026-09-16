import { ShieldCheck, UserCheck, FileText, CheckCircle } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const PRE_CADASTRO_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <ShieldCheck className="h-6 w-6 text-[#3b82f6]" />,
    title: "Verificação 2FA",
    description:
      "Confirme sua identidade via PIN de 6 dígitos enviado pelo WhatsApp ou e-mail. O código expira em 5 minutos.",
  },
  {
    icon: <UserCheck className="h-6 w-6 text-[#3b82f6]" />,
    title: "Tipo de Pessoa",
    description:
      "Escolha entre PF (pessoa física com CPF) ou PJ (pessoa jurídica com CNPJ). Isso define os campos do formulário.",
  },
  {
    icon: <FileText className="h-6 w-6 text-[#3b82f6]" />,
    title: "Dados e Documentos",
    description:
      "Preencha seus dados pessoais ou empresariais, endereços e envie os documentos necessários. Campos com * são obrigatórios.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-[#3b82f6]" />,
    title: "Envio",
    description:
      "Revise suas informações e envie para análise. Você receberá uma confirmação e acompanhará o status pelo painel.",
  },
]
