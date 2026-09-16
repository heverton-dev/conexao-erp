import { Bot, Globe, Layers, Database, MessageCircle, Sparkles } from "lucide-react";
import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog";

export const AGENTES_ONBOARDING_STEPS: WalkthroughStep[] = [
  {
    icon: <Sparkles className="h-6 w-6 text-[#c9a655]" />,
    title: "Agentes IA",
    description:
      "Crie agentes inteligentes personalizados para cada modulo da sua empresa. Cada agente pode ter sua propria base de conhecimento e comportamento.",
  },
  {
    icon: <Globe className="h-6 w-6 text-[#c9a655]" />,
    title: "Configuracao da API",
    description:
      "Na primeira etapa, configure a URL e a chave da API do provedor de IA (OpenAI-compatible). Voce pode testar a conexao antes de prosseguir.",
  },
  {
    icon: <Layers className="h-6 w-6 text-[#c9a655]" />,
    title: "Modulo e Nome",
    description:
      "Escolha qual modulo o agente vai atender (Hub, NPS, CRM, etc.) e de um nome descritivo. O agente so respondera assuntos daquele modulo.",
  },
  {
    icon: <Database className="h-6 w-6 text-[#c9a655]" />,
    title: "Base de Conhecimento",
    description:
      "Adicione documentos (TXT, JSON, HTML, CSV, PDF) e selecione tabelas do banco de dados. O agente usara essas informacoes como contexto nas respostas.",
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-[#c9a655]" />,
    title: "Playground",
    description:
      "Apos criar o agente, use o Playground para testar com perguntas reais. Verifique se as respostas estao corretas antes de ativar o agente no modulo.",
  },
  {
    icon: <Bot className="h-6 w-6 text-[#c9a655]" />,
    title: "Renderizacao",
    description:
      "Escolha como o agente aparece no modulo: como um botao flutuante no canto inferior direito, ou como um icone no cabecalho do modulo.",
  },
];
