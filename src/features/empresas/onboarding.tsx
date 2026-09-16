import { Building2, Palette, Key, Database, Zap } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const EMPRESAS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Building2 className="h-6 w-6 text-[#6366f1]" />,
    title: "Dados da Empresa",
    description:
      "Configure razão social, CNPJ, endereço, redes sociais e informações de contato da empresa.",
  },
  {
    icon: <Palette className="h-6 w-6 text-[#6366f1]" />,
    title: "Design",
    description:
      "Personalize cores, tema e branding de toda a aplicação. As cores afetam todos os módulos e a área pública.",
  },
  {
    icon: <Key className="h-6 w-6 text-[#6366f1]" />,
    title: "Credenciais",
    description:
      "Gerencie acessos e permissões por ambiente: cadastro, consultor, tecnologia e suporte. Controle quem vê o quê.",
  },
  {
    icon: <Database className="h-6 w-6 text-[#6366f1]" />,
    title: "Banco de Dados",
    description:
      "Configure a conexão com banco de dados externo. Gere scripts SQL para criação de tabelas e views.",
  },
  {
    icon: <Zap className="h-6 w-6 text-[#6366f1]" />,
    title: "Central de Ações",
    description:
      "Webhooks e automações entre módulos. Configure eventos que disparam ações automáticas no sistema.",
  },
]
