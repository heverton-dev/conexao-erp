const STORAGE_PREFIX = "onboarding_enabled_"

export type ModuloOnboardingKey =
  | "cadastros"
  | "nps"
  | "hub"
  | "crm"
  | "empresas-core"
  | "funis"
  | "despesas"
  | "rotas"
  | "mapas-interativos"
  | "linktree"
  | "gerador-links"
  | "manutencao"

export interface RotaOnboarding {
  key: string
  label: string
  modulo: ModuloOnboardingKey
}

export const ROTAS_ONBOARDING: RotaOnboarding[] = [
  { key: "catalogo_produtos", label: "Gestão de Produtos", modulo: "cadastros" },
  { key: "catalogo_cadastros", label: "Cadastros Auxiliares", modulo: "cadastros" },
  { key: "catalogo_configuracoes", label: "Configurações do Catálogo", modulo: "cadastros" },
  { key: "nps_dashboard", label: "Dashboard NPS", modulo: "nps" },
  { key: "nps_pesquisas", label: "Gerenciar Pesquisas", modulo: "nps" },
  { key: "nps_relatorios", label: "Relatórios NPS", modulo: "nps" },
  { key: "hub_materiais", label: "Materiais", modulo: "hub" },
  { key: "hub_trilhas", label: "Trilhas de Aprendizado", modulo: "hub" },
  { key: "hub_badges", label: "Badges & Conquistas", modulo: "hub" },
  { key: "hub_analytics", label: "Analytics do Hub", modulo: "hub" },
  { key: "crm_dashboard", label: "Dashboard CRM", modulo: "crm" },
  { key: "crm_pipeline", label: "Pipeline de Vendas", modulo: "crm" },
  { key: "crm_carteira", label: "Carteira de Clientes", modulo: "crm" },
  { key: "crm_tarefas", label: "Tarefas", modulo: "crm" },
  { key: "crm_equipe", label: "Gestão de Equipe", modulo: "crm" },
  { key: "funis_dashboard", label: "Dashboard Funis", modulo: "funis" },
  { key: "funis_criar", label: "Criar Funil", modulo: "funis" },
  { key: "funis_templates", label: "Templates", modulo: "funis" },
  { key: "despesas_lancar", label: "Lançar Despesa", modulo: "despesas" },
  { key: "despesas_aprovacao", label: "Aprovação de Despesas", modulo: "despesas" },
  { key: "despesas_relatorios", label: "Relatórios de Despesas", modulo: "despesas" },
  { key: "rotas_planejamento", label: "Planejamento de Rotas", modulo: "rotas" },
  { key: "rotas_execucao", label: "Execução de Campo", modulo: "rotas" },
  { key: "linktree_dashboard", label: "Dashboard LinkTree", modulo: "linktree" },
  { key: "linktree_empresa", label: "Linktree da Empresa", modulo: "linktree" },
  { key: "linktree_tema", label: "Tema e Customização", modulo: "linktree" },
  { key: "gerador_whatsapp", label: "Links WhatsApp", modulo: "gerador-links" },
  { key: "gerador_utm", label: "Gerador UTM", modulo: "gerador-links" },
  { key: "gerador_qrcode", label: "QR Code", modulo: "gerador-links" },
  { key: "manutencao_global", label: "Painel Global", modulo: "manutencao" },
  { key: "manutencao_empresa", label: "Painel da Empresa", modulo: "manutencao" },
  { key: "mapas_distribuidores", label: "Mapa de Distribuidores", modulo: "mapas-interativos" },
  { key: "mapas_consultores", label: "Mapa de Consultores", modulo: "mapas-interativos" },
  { key: "mapas_insights", label: "Insights de Presença", modulo: "mapas-interativos" },
]

export const MODULOS_ONBOARDING: Record<ModuloOnboardingKey, { label: string; color: string }> = {
  cadastros: { label: "Cadastros", color: "#3b82f6" },
  nps: { label: "NPS", color: "#8b5cf6" },
  hub: { label: "Hub", color: "#f59e0b" },
  crm: { label: "CRM", color: "#10b981" },
  "empresas-core": { label: "Empresa", color: "#6366f1" },
  funis: { label: "Funis", color: "#ec4899" },
  despesas: { label: "Despesas", color: "#f97316" },
  rotas: { label: "Rotas", color: "#14b8a6" },
  "mapas-interativos": { label: "Mapas", color: "#06b6d4" },
  linktree: { label: "LinkTree", color: "#a855f7" },
  "gerador-links": { label: "Gerador de Links", color: "#22c55e" },
  manutencao: { label: "Manutenção", color: "#64748b" },
}

export function isOnboardingEnabled(moduleKey: string): boolean {
  if (typeof window === "undefined") return true
  const stored = localStorage.getItem(STORAGE_PREFIX + moduleKey)
  if (stored === null) return true
  return stored === "true"
}

export function setOnboardingEnabled(moduleKey: string, enabled: boolean): void {
  localStorage.setItem(STORAGE_PREFIX + moduleKey, String(enabled))
}

export function getAllOnboardingConfig(): Record<string, boolean> {
  const config: Record<string, boolean> = {}
  for (const key of Object.keys(MODULOS_ONBOARDING)) {
    config[key] = isOnboardingEnabled(key)
  }
  for (const route of ROTAS_ONBOARDING) {
    config[route.key] = isOnboardingEnabled(route.key)
  }
  return config
}

export function setAllOnboardingConfig(config: Record<string, boolean>): void {
  for (const [key, enabled] of Object.entries(config)) {
    setOnboardingEnabled(key, enabled)
  }
}
