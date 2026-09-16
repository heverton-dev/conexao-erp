import { Layers, ShoppingBag, Package, Eye, DollarSign, GitBranch, Settings, Database } from "lucide-react"
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"

export const CATALOGO_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Layers className="h-6 w-6 text-[#c9a655]" />,
    title: "Cadastros Auxiliares",
    description:
      "Comece configurando as tabelas base em 'Cadastros Auxiliares': Categorias, Conexões, Famílias e Linhas. Essa hierarquia define a árvore de produtos do catálogo.",
  },
  {
    icon: <GitBranch className="h-6 w-6 text-[#c9a655]" />,
    title: "Hierarquia de Produtos",
    description:
      "A sequência é: Categoria → Conexão → Família → Linha. Cada novo produto precisa estar vinculado a essa estrutura. Defina tudo antes de cadastrar produtos.",
  },
  {
    icon: <Package className="h-6 w-6 text-[#c9a655]" />,
    title: "Cadastro de Produtos",
    description:
      "Com a hierarquia pronta, vá em 'Gestão de Produtos' e cadastre Implantes, Componentes (Abutments) e Kits. Preencha SKU, dimensões e especificações.",
  },
  {
    icon: <ShoppingBag className="h-6 w-6 text-[#c9a655]" />,
    title: "Protocolos e Sequências",
    description:
      "Para implantes, cadastre o Protocolo de Fresagem (Hard e Soft). Para componentes, cadastre a Sequência Protética (Analógica e Digital) com seus acessórios.",
  },
  {
    icon: <Eye className="h-6 w-6 text-[#c9a655]" />,
    title: "Ativação e Vitrine",
    description:
      "Use os toggles nas listas para ativar/desativar produtos. Apenas itens ativos aparecem na vitrine pública do catálogo.",
  },
  {
    icon: <DollarSign className="h-6 w-6 text-[#c9a655]" />,
    title: "Preços e Grupos",
    description:
      "Configure preços em 'Gestão de Produtos' e crie Grupos de Clientes para controle de acesso e descontos diferenciados por perfil.",
  },
]

export const PRODUTOS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Package className="h-6 w-6 text-[#c9a655]" />,
    title: "Criar Produto",
    description:
      "Clique em 'NOVO PRODUTO' para cadastrar um Implante, Componente ou Kit. Preencha SKU, hierarquia e especificações técnicas.",
  },
  {
    icon: <Eye className="h-6 w-6 text-[#c9a655]" />,
    title: "Ativar / Desativar",
    description:
      "Use o toggle na coluna 'Ativo' para ligar ou desligar um produto. Produtos inativos não aparecem na vitrine pública.",
  },
  {
    icon: <DollarSign className="h-6 w-6 text-[#c9a655]" />,
    title: "Definir Preço",
    description:
      "Ao cadastrar ou editar, preencha o campo 'Preço (R$)' para que o produto apareça com valor na vitrine e no carrinho.",
  },
  {
    icon: <ShoppingBag className="h-6 w-6 text-[#c9a655]" />,
    title: "Protocolo de Fresagem",
    description:
      "Para implantes, adicione fresas na seção 'Sequência de Fresagem' durante o cadastro. Essas informações aparecem na ficha técnica do produto.",
  },
  {
    icon: <Layers className="h-6 w-6 text-[#c9a655]" />,
    title: "Sequência Protética",
    description:
      "Para componentes (abutments), adicione etapas nas sequências analógica e digital durante o cadastro. Acesse editando o componente.",
  },
]

export const CADASTROS_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Database className="h-6 w-6 text-[#c9a655]" />,
    title: "Categorias",
    description:
      "Cadastre as categorias de produtos (ex: Implante, Componente, Kit). Cada categoria agrupa uma árvore de conexões e famílias.",
  },
  {
    icon: <GitBranch className="h-6 w-6 text-[#c9a655]" />,
    title: "Conexões",
    description:
      "Defina as conexões dentro de cada categoria (ex: NP, MK, TS). A sigla da conexão é usada na geração automática de SKU.",
  },
  {
    icon: <Layers className="h-6 w-6 text-[#c9a655]" />,
    title: "Famílias",
    description:
      "Crie famílias dentro de cada conexão. Defina a cor de identificação que será usada em badges e cards do catálogo público.",
  },
  {
    icon: <Package className="h-6 w-6 text-[#c9a655]" />,
    title: "Linhas",
    description:
      "Adicione linhas dentro de cada família. Cada linha representa uma variação de produto (ex: diferentes diâmetros e comprimentos).",
  },
]

export const CONFIG_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Settings className="h-6 w-6 text-[#c9a655]" />,
    title: "Dados da Loja",
    description:
      "Configure nome, CNPJ, email de contato e endereço da loja. Essas informações aparecem na vitrine pública e nos pedidos.",
  },
  {
    icon: <Eye className="h-6 w-6 text-[#c9a655]" />,
    title: "Preferências de Exibição",
    description:
      "Defina se preços e estoque ficam visíveis na vitrine. Controle o checkout e cupons de desconto.",
  },
  {
    icon: <Package className="h-6 w-6 text-[#c9a655]" />,
    title: "Categorias e Conexões",
    description:
      "Gerencie categorias e conexões diretamente na página de configurações. Use os toggles para ativar ou desativar.",
  },
]

export interface OnboardingRoute {
  key: string
  label: string
  steps: WalkthroughStep[]
}

export const CATALOGO_ONBOARDING_ROUTES: OnboardingRoute[] = [
  { key: "catalogo_produtos", label: "Gestão de Produtos", steps: PRODUTOS_ONBOARDING_STEPS },
  { key: "catalogo_cadastros", label: "Cadastros Auxiliares", steps: CADASTROS_ONBOARDING_STEPS },
  { key: "catalogo_configuracoes", label: "Configurações do Catálogo", steps: CONFIG_ONBOARDING_STEPS },
]
