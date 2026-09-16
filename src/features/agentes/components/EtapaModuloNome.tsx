import { useAuth } from "~/lib/auth";
import { Bot, User, Layers, MessageSquare } from "lucide-react";

const MODULO_OPTIONS = [
  { key: "cadastros", label: "Cadastros" },
  { key: "nps", label: "NPS" },
  { key: "hub", label: "Hub" },
  { key: "crm", label: "CRM" },
  { key: "funis", label: "Funis" },
  { key: "despesas", label: "Despesas" },
  { key: "rotas", label: "Rotas" },
  { key: "linktree", label: "LinkTree" },
  { key: "mapas-interativos", label: "Mapas" },
  { key: "gerador-links", label: "Links" },
  { key: "catalogo", label: "Catalogo" },
  { key: "marketing", label: "Marketing" },
  { key: "empresas-core", label: "Empresa" },
];

const ROTAS_POR_MODULO: Record<string, { path: string; label: string }[]> = {
  cadastros: [
    { path: "/cadastros/dashboard", label: "Dashboard" },
    { path: "/cadastros/solicitacoes", label: "Solicitacoes" },
    { path: "/cadastros/clientes", label: "Clientes" },
    { path: "/cadastros/consultor", label: "Consultor" },
    { path: "/cadastros/relatorios", label: "Relatorios" },
  ],
  nps: [
    { path: "/nps/dashboard", label: "Dashboard NPS" },
    { path: "/nps/pesquisas", label: "Pesquisas" },
    { path: "/nps/relatorios", label: "Relatorios" },
  ],
  hub: [
    { path: "/hub/admin/dashboard", label: "Admin Dashboard" },
    { path: "/hub/admin/materiais", label: "Materiais" },
    { path: "/hub/admin/trilhas", label: "Trilhas" },
    { path: "/hub/admin/badges", label: "Badges" },
    { path: "/hub/admin/analytics", label: "Analytics Admin" },
    { path: "/hub/gestor/dashboard", label: "Dashboard Gestor" },
    { path: "/hub/consultor/dashboard", label: "Dashboard Consultor" },
  ],
  crm: [
    { path: "/crm/dashboard", label: "Dashboard CRM" },
    { path: "/crm/carteira", label: "Carteira" },
    { path: "/crm/pipeline", label: "Pipeline" },
    { path: "/crm/tarefas", label: "Tarefas" },
    { path: "/crm/equipe", label: "Equipe" },
    { path: "/crm/metricas", label: "Metricas" },
    { path: "/crm/bi", label: "BI" },
  ],
  funis: [
    { path: "/funis/dashboard", label: "Dashboard Funis" },
    { path: "/funis/templates", label: "Templates" },
  ],
  despesas: [
    { path: "/despesas", label: "Despesas" },
    { path: "/despesas/aprovacao", label: "Aprovacao" },
    { path: "/despesas/meus-relatorios", label: "Meus Relatorios" },
    { path: "/despesas/relatorios", label: "Relatorios" },
  ],
  rotas: [
    { path: "/rotas", label: "Rotas" },
  ],
  linktree: [
    { path: "/linktree/dashboard", label: "Dashboard Linktree" },
    { path: "/linktree/empresa", label: "Linktree Empresa" },
  ],
  "mapas-interativos": [
    { path: "/mapas", label: "Mapa de Presenca" },
    { path: "/mapas/gestao/distribuidores", label: "Distribuidores" },
    { path: "/mapas/gestao/consultores", label: "Consultores" },
    { path: "/mapas/insights", label: "Insights" },
  ],
  "gerador-links": [
    { path: "/ferramentas/links", label: "Dashboard Links" },
    { path: "/ferramentas/links/historico", label: "Historico" },
    { path: "/ferramentas/links/templates", label: "Templates" },
    { path: "/ferramentas/links/whatsapp", label: "WhatsApp" },
  ],
  catalogo: [
    { path: "/catalogo", label: "Preview Loja" },
    { path: "/catalogo/admin/dashboard", label: "Dashboard" },
    { path: "/catalogo/admin/produtos", label: "Produtos" },
    { path: "/catalogo/admin/cadastros", label: "Cadastros" },
    { path: "/catalogo/admin/cupons", label: "Cupons" },
    { path: "/catalogo/admin/frete", label: "Frete" },
    { path: "/catalogo/admin/promocionais", label: "Promocoes" },
    { path: "/catalogo/admin/configuracoes", label: "Configuracoes" },
    { path: "/catalogo/admin/design", label: "Design da Loja" },
    { path: "/catalogo/admin/clientes", label: "Clientes" },
    { path: "/catalogo/admin/grupos", label: "Grupos" },
    { path: "/catalogo/admin/orcamentos", label: "Orcamentos" },
    { path: "/catalogo/admin/pedidos", label: "Pedidos" },
    { path: "/catalogo/admin/solicitacoes", label: "Solicitacoes" },
  ],
  marketing: [
    { path: "/marketing/dashboard", label: "Dashboard Marketing" },
    { path: "/marketing/seo", label: "SEO" },
    { path: "/marketing/leads", label: "Leads" },
    { path: "/marketing/landing-pages", label: "Landing Pages" },
    { path: "/marketing/email", label: "E-mail Marketing" },
    { path: "/marketing/whatsapp", label: "WhatsApp" },
    { path: "/marketing/criativos", label: "Criativos" },
    { path: "/marketing/calendario", label: "Calendario" },
  ],
  "empresas-core": [
    { path: "/empresa", label: "Dados da Empresa" },
    { path: "/empresa/banco", label: "Banco de Dados" },
    { path: "/empresa/permissoes", label: "Permissoes" },
    { path: "/empresa/design", label: "Design" },
  ],
};

interface Props {
  nome: string;
  setNome: (v: string) => void;
  moduloKey: string;
  setModuloKey: (v: string) => void;
  route: string;
  setRoute: (v: string) => void;
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
  renderMode: "floating" | "header_icon";
  setRenderMode: (v: "floating" | "header_icon") => void;
}

export function EtapaModuloNome({
  nome,
  setNome,
  moduloKey,
  setModuloKey,
  route,
  setRoute,
  systemPrompt,
  setSystemPrompt,
  renderMode,
  setRenderMode,
}: Props) {
  const { modulosAtivos, profile } = useAuth();
  const isSuperAdmin = profile?.is_super_admin === true;

  const modulosDisponiveis = isSuperAdmin
    ? MODULO_OPTIONS
    : MODULO_OPTIONS.filter((m) => modulosAtivos?.includes(m.key));

  const rotasDoModulo = moduloKey ? (ROTAS_POR_MODULO[moduloKey] ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
          <Bot className="h-6 w-6 text-accent" />
        </div>
        <h3 className="text-lg font-bold text-white">Modulo e Nome</h3>
        <p className="text-sm text-gray-400">
          Escolha o modulo e de um nome ao agente
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
            Nome do Agente *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Assistente de Cadastros"
            className="w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-sm outline-none focus:border-accent/40"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
            Modulo *
          </label>
          <select
            value={moduloKey}
            onChange={(e) => setModuloKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-sm outline-none focus:border-accent/40 cursor-pointer"
          >
            <option value="">Selecione um modulo</option>
            {modulosDisponiveis.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {rotasDoModulo.length > 0 && (
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
              Rota de Aparecimento *
            </label>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-sm outline-none focus:border-accent/40 cursor-pointer"
            >
              <option value="">Selecione a rota</option>
              {rotasDoModulo.map((r) => (
                <option key={r.path} value={r.path}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-text-muted mt-1">
              O agente aparecera nesta pagina do modulo
            </p>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
            System Prompt (opcional)
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Instrucoes de comportamento do agente..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-sm outline-none focus:border-accent/40 resize-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">
            Modo de Renderizacao
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRenderMode("floating")}
              className={`p-3 rounded-xl border text-left transition-all ${
                renderMode === "floating"
                  ? "border-accent bg-accent/10"
                  : "border-border-subtle hover:border-white/20"
              }`}
            >
              <MessageSquare size={18} className={renderMode === "floating" ? "text-accent" : "text-text-muted"} />
              <p className="text-xs font-bold text-text-main mt-1.5">Botao Flutuante</p>
              <p className="text-[10px] text-text-muted mt-0.5">Canto inferior direito</p>
            </button>
            <button
              type="button"
              onClick={() => setRenderMode("header_icon")}
              className={`p-3 rounded-xl border text-left transition-all ${
                renderMode === "header_icon"
                  ? "border-accent bg-accent/10"
                  : "border-border-subtle hover:border-white/20"
              }`}
            >
              <Layers size={18} className={renderMode === "header_icon" ? "text-accent" : "text-text-muted"} />
              <p className="text-xs font-bold text-text-main mt-1.5">Icone no Header</p>
              <p className="text-[10px] text-text-muted mt-0.5">Barra superior do modulo</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
