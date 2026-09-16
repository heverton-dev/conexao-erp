import type { WalkthroughStep } from "~/core/onboarding/WalkthroughDialog"
import { LayoutDashboard, FileText, BarChart3, Users, ShoppingCart, ClipboardList, Target, Settings, MessageSquare, TrendingUp, Send, Map, Link, QrCode, Palette, Wrench, Globe, Building, Eye, UserCheck, Bot, Trophy, BookOpen, FileBarChart } from "lucide-react"

export const ROUTE_ONBOARDING_STEPS: Record<string, WalkthroughStep[]> = {
  // ─── NPS ────────────────────────────────────────────────────────
  nps_dashboard: [
    { icon: <LayoutDashboard className="h-6 w-6 text-[#8b5cf6]" />, title: "Dashboard NPS", description: "Visão geral do NPS da empresa com gráficos de tendência, distribuição de notas e evolução ao longo do tempo." },
    { icon: <BarChart3 className="h-6 w-6 text-[#8b5cf6]" />, title: "Indicadores", description: "Acompanhe Promotores (9-10), Neutros (7-8) e Detratores (0-6). O NPS é calculado automaticamente." },
    { icon: <TrendingUp className="h-6 w-6 text-[#8b5cf6]" />, title: "Tendência", description: "O gráfico de evolução mostra a variação do NPS ao longo dos meses. Compare períodos para identificar melhorias." },
  ],
  nps_pesquisas: [
    { icon: <FileText className="h-6 w-6 text-[#8b5cf6]" />, title: "Criar Pesquisa", description: "Crie pesquisas NPS com perguntas personalizadas. Tipos: escala 0-10, escolha única, múltipla escolha e texto livre." },
    { icon: <ClipboardList className="h-6 w-6 text-[#8b5cf6]" />, title: "Gerenciar Perguntas", description: "Edite, reordene e ative/desative perguntas. A primeira pergunta NPS (0-10) é obrigatória." },
    { icon: <Eye className="h-6 w-6 text-[#8b5cf6]" />, title: "Preview", description: "Visualize a pesquisa como o cliente verá antes de enviar. Verifique layout e ordenação." },
  ],
  nps_relatorios: [
    { icon: <BarChart3 className="h-6 w-6 text-[#8b5cf6]" />, title: "Relatórios de Envio", description: "Acompanhe quantas pesquisas foram enviadas, quantas respondidas e a taxa de resposta." },
    { icon: <FileBarChart className="h-6 w-6 text-[#8b5cf6]" />, title: "Análise de Respostas", description: "Filtre por período, status e nota. Identifique tendências e padrões nas respostas." },
  ],

  // ─── Hub ─────────────────────────────────────────────────────────
  hub_materiais: [
    { icon: <BookOpen className="h-6 w-6 text-[#f59e0b]" />, title: "Cadastrar Materiais", description: "Adicione documentos, vídeos e conteúdos. Organize por tipo, tag e nível de dificuldade." },
    { icon: <Eye className="h-6 w-6 text-[#f59e0b]" />, title: "Visualizar", description: "Preview do material como o colaborador verá. Verifique se o conteúdo está correto antes de publicar." },
  ],
  hub_trilhas: [
    { icon: <Target className="h-6 w-6 text-[#f59e0b]" />, title: "Criar Trilha", description: "Organize materiais em sequências progressivas. Defina pré-requisitos e ordem de conclusão." },
    { icon: <ClipboardList className="h-6 w-6 text-[#f59e0b]" />, title: "Etapas", description: "Adicione etapas à trilha com materiais específicos. Cada etapa pode ter quiz de validação." },
  ],
  hub_badges: [
    { icon: <Trophy className="h-6 w-6 text-[#f59e0b]" />, title: "Badges e Conquistas", description: "Configure insignias e recompensas para gamificação. Desbloqueie conquistas ao completar trilhas." },
  ],
  hub_analytics: [
    { icon: <BarChart3 className="h-6 w-6 text-[#f59e0b]" />, title: "Analytics do Hub", description: "Acompanhe engajamento, tempo de estudo e progresso dos colaboradores. Dashboards para admin e gestores." },
  ],

  // ─── CRM ─────────────────────────────────────────────────────────
  crm_dashboard: [
    { icon: <LayoutDashboard className="h-6 w-6 text-[#10b981]" />, title: "Dashboard CRM", description: "Visão geral adaptada ao seu perfil: consultor vê sua carteira, gestor vê a equipe, diretor vê métricas." },
    { icon: <BarChart3 className="h-6 w-6 text-[#10b981]" />, title: "Métricas", description: "Acompanhe KPIs de vendas, taxa de conversão e pipeline em tempo real." },
  ],
  crm_pipeline: [
    { icon: <Target className="h-6 w-6 text-[#10b981]" />, title: "Pipeline de Vendas", description: "Kanban com estágios: Prospecção → Qualificação → Proposta → Fechamento. Arraste cards entre colunas." },
    { icon: <ShoppingCart className="h-6 w-6 text-[#10b981]" />, title: "Cards de Venda", description: "Cada card representa uma oportunidade. Clique para ver detalhes, histórico e ações disponíveis." },
  ],
  crm_carteira: [
    { icon: <Users className="h-6 w-6 text-[#10b981]" />, title: "Carteira de Clientes", description: "Portfólio por temperatura: Frio (novo), Morno (engajado), Quente (próximo do fechamento)." },
  ],
  crm_tarefas: [
    { icon: <ClipboardList className="h-6 w-6 text-[#10b981]" />, title: "Tarefas e Follow-ups", description: "Gerencie atividades com clientes. Crie tarefas com prazo, prioridade e vinculação ao cliente." },
  ],
  crm_equipe: [
    { icon: <UserCheck className="h-6 w-6 text-[#10b981]" />, title: "Gestão de Equipe", description: "Convide consultores por email. Defina gestores e transfira clientes entre consultores." },
  ],

  // ─── Funis ───────────────────────────────────────────────────────
  funis_dashboard: [
    { icon: <LayoutDashboard className="h-6 w-6 text-[#ec4899]" />, title: "Dashboard Funis", description: "Visão geral dos funis ativos, métricas de conversão e atividade recente." },
  ],
  funis_criar: [
    { icon: <Target className="h-6 w-6 text-[#ec4899]" />, title: "Criar Funil", description: "Monte colunas Kanban com estágios. Defina limites WIP e ordem das colunas por arrasto." },
    { icon: <MessageSquare className="h-6 w-6 text-[#ec4899]" />, title: "Task Cards", description: "Cards com comentários, anexos, labels e responsável. Mova entre colunas por drag and drop." },
  ],
  funis_templates: [
    { icon: <FileText className="h-6 w-6 text-[#ec4899]" />, title: "Templates", description: "Crie funis a partir de templates reutilizáveis. Economize tempo replicando estruturas comprovadas." },
  ],

  // ─── Despesas ────────────────────────────────────────────────────
  despesas_lancar: [
    { icon: <FileText className="h-6 w-6 text-[#f97316]" />, title: "Lançar Despesa", description: "Registre despesas com tipo, valor, data, descrição e comprovante. Cada despesa é vinculada a um período." },
  ],
  despesas_aprovacao: [
    { icon: <UserCheck className="h-6 w-6 text-[#f97316]" />, title: "Aprovação", description: "Aprove ou reprove despesas da equipe. Adicione observações ao reprovar para que o colaborador corrija." },
  ],
  despesas_relatorios: [
    { icon: <BarChart3 className="h-6 w-6 text-[#f97316]" />, title: "Relatórios", description: "Acompanhe gastos por período, tipo de despesa e colaborador. Exporte dados para análise externa." },
  ],

  // ─── Rotas ───────────────────────────────────────────────────────
  rotas_planejamento: [
    { icon: <Map className="h-6 w-6 text-[#14b8a6]" />, title: "Planejar Rota", description: "Crie rotas adicionando paradas em clientes. Defina a ordem de visita e visualize no mapa." },
  ],
  rotas_execucao: [
    { icon: <Send className="h-6 w-6 text-[#14b8a6]" />, title: "Executar Rota", description: "Inicie a rota em campo. Marque conclusão de cada parada e registre o tempo real de visita." },
  ],

  // ─── Linktree ────────────────────────────────────────────────────
  linktree_dashboard: [
    { icon: <BarChart3 className="h-6 w-6 text-[#a855f7]" />, title: "Analytics LinkTree", description: "Veja cliques e engajamento dos links. Identifique quais links são mais acessados." },
  ],
  linktree_empresa: [
    { icon: <Building className="h-6 w-6 text-[#a855f7]" />, title: "Linktree da Empresa", description: "Gerencie os links institucionais. Mantenha informações de contato e redes sociais atualizadas." },
  ],
  linktree_tema: [
    { icon: <Palette className="h-6 w-6 text-[#a855f7]" />, title: "Tema e Customização", description: "Personalize cores, fontes e aparência. Configure tema claro ou escuro com cores da marca." },
  ],

  // ─── Gerador de Links ────────────────────────────────────────────
  gerador_whatsapp: [
    { icon: <MessageSquare className="h-6 w-6 text-[#22c55e]" />, title: "Links WhatsApp", description: "Gere links com mensagem pré-preenchida. O cliente clica e já abre o WhatsApp com sua mensagem." },
  ],
  gerador_utm: [
    { icon: <Link className="h-6 w-6 text-[#22c55e]" />, title: "Gerador UTM", description: "Construa parâmetros UTM para campanhas de marketing. Rastreie origem, mídia e campanha." },
  ],
  gerador_qrcode: [
    { icon: <QrCode className="h-6 w-6 text-[#22c55e]" />, title: "QR Code", description: "Crie QR codes para qualquer link. Personalize cores e baixe em alta resolução para impressão." },
  ],

  // ─── Manutenção ──────────────────────────────────────────────────
  manutencao_global: [
    { icon: <Globe className="h-6 w-6 text-[#64748b]" />, title: "Painel Global", description: "Ative ou desative o modo manutenção por módulo em todo o sistema. Disponível apenas para Super Admin." },
  ],
  manutencao_empresa: [
    { icon: <Building className="h-6 w-6 text-[#64748b]" />, title: "Painel da Empresa", description: "Gerencie manutenção por empresa. O Admin pode desativar módulos específicos para sua organização." },
  ],

  // ─── Mapas ───────────────────────────────────────────────────────
  mapas_distribuidores: [
    { icon: <Map className="h-6 w-6 text-[#06b6d4]" />, title: "Mapa de Distribuidores", description: "Visualize distribuidores por estado no mapa do Brasil. Clique em um estado para ver detalhes." },
  ],
  mapas_consultores: [
    { icon: <Users className="h-6 w-6 text-[#06b6d4]" />, title: "Mapa de Consultores", description: "Localize consultores geograficamente. Veja cobertura por região e identifique áreas sem presença." },
  ],
  mapas_insights: [
    { icon: <TrendingUp className="h-6 w-6 text-[#06b6d4]" />, title: "Insights de Presença", description: "Análise de presença comercial e cobertura. Identifique oportunidades e lacunas no mapa de atuação." },
  ],
}
