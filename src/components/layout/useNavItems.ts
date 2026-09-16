import {
  Building2,
  Puzzle,
  KeyRound,
  Globe,
  Database,
  Cable,
  FlaskConical,
  Palette,
  Image,
  Shield,
  Beaker,
  Bell,
  Webhook as WebhookIcon,
  BarChart3,
  FileText,
  Bug,
  BrainCircuit,
  Wrench,
  HelpCircle,
  Bot,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "~/lib/auth";
import { getNavItems, getAllModules, getNavItemsByModule } from "~/registry";
import { useMemo } from "react";

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  matchPaths?: string[];
  noChildMatch?: boolean;
  external?: boolean;
};

export type NavSubGroup = {
  label?: string;
  items: NavItem[];
};

export type NavModuleSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  subGroups?: NavSubGroup[];
};

function filterRegistryItems(
  moduloKey: string,
  isSuper: boolean,
  isCompanyAdmin: boolean,
  modulosAcesso:
    | Record<string, { acessar?: boolean; paginas?: string[] }>
    | null
    | undefined,
): NavItem[] {
  let registryItems = getNavItemsByModule(moduloKey);

  if (!isSuper) {
    if (moduloKey === "empresas-core" && isCompanyAdmin) {
      // não filtra empresas-core para admin da empresa
    } else {
      const paginasPermitidas = modulosAcesso?.[moduloKey]?.paginas ?? [];
      registryItems = registryItems.filter((item) =>
        paginasPermitidas.includes(item.id),
      );
    }
  }

  return registryItems.map((ri) => ({
    path: ri.to,
    label: ri.label,
    icon: ri.icon,
    ...(ri.matchPaths ? { matchPaths: ri.matchPaths } : {}),
    ...(ri.noChildMatch ? { noChildMatch: ri.noChildMatch } : {}),
    ...(ri.external ? { external: true } : {}),
  }));
}

function buildHubSubGroups(items: NavItem[]): NavSubGroup[] {
  const adminItems = items.filter((i) => i.path.startsWith("/hub/admin/"));
  const gestorItems = items.filter((i) => i.path.startsWith("/hub/gestor/"));
  const consultorItems = items.filter((i) =>
    i.path.startsWith("/hub/consultor/"),
  );
  const distribuidorItems = items.filter((i) =>
    i.path.startsWith("/hub/distribuidor/"),
  );
  const globalItems = items.filter(
    (i) =>
      i.path.startsWith("/global/hub") ||
      i.path.startsWith("/empresa/hub") ||
      i.path === "/hub/design",
  );

  const subGroups: NavSubGroup[] = [];
  if (adminItems.length) subGroups.push({ label: "Admin", items: adminItems });
  if (gestorItems.length)
    subGroups.push({ label: "Gestor", items: gestorItems });
  if (consultorItems.length)
    subGroups.push({ label: "Consultor", items: consultorItems });
  if (distribuidorItems.length)
    subGroups.push({ label: "Distribuidor", items: distribuidorItems });
  if (globalItems.length)
    subGroups.push({ label: "Global", items: globalItems });
  return subGroups;
}

function buildConfigSubGroups(items: NavItem[]): NavSubGroup[] {
  // 1. EMPRESA
  const empresaPaths = [
    "/empresa",
    "/empresa/banco",
    "/empresa/permissoes",
    "/empresa/branding",
    "/empresa/design",
    "/empresa/acoes",
  ];
  const empresaItems = items.filter((i) => empresaPaths.includes(i.path));

  // 2. CONFIGURAÇÃO DE RECURSOS
  const configPaths = [
    "/empresa/despesas-config",
    "/empresa/clientes-import",
    "/empresa/rotas/config",
    "/empresa/hub/chatbot",
    "/empresa/cadastros/formulario",
    "/empresa/onboarding",
    "/empresa/agentes",
    "/empresa/manutencao",
  ];
  const configItems = items.filter((i) => configPaths.includes(i.path));

  // 3. TEMAS DE MÓDULOS
  const temaPaths = ["/empresa/nps/tema", "/empresa/linktree/tema"];
  const temaItems = items.filter((i) => temaPaths.includes(i.path));

  // 4. DESIGN SYSTEM
  const designItems = items.filter(
    (i) => i.path.endsWith("/design") && i.path !== "/empresa/design",
  );

  const subGroups: NavSubGroup[] = [];
  if (empresaItems.length)
    subGroups.push({ label: "Empresa", items: empresaItems });
  if (configItems.length)
    subGroups.push({ label: "Configurações de Módulos", items: configItems });
  if (temaItems.length)
    subGroups.push({ label: "Temas e Aparência", items: temaItems });
  if (designItems.length)
    subGroups.push({ label: "Design System", items: designItems });

  return subGroups;
}

function buildMarketingSubGroups(items: NavItem[]): NavSubGroup[] {
  // 1. Dashboard & Analytics
  const analyticsPaths = [
    "/marketing/dashboard",
    "/marketing/seo",
    "/marketing/email/analytics",
  ];
  const analyticsItems = items.filter((i) => analyticsPaths.includes(i.path));

  // 2. Captação & Leads
  const captePaths = ["/marketing/leads", "/marketing/landing-pages"];
  const capteItems = items.filter(
    (i) => captePaths.includes(i.path) || i.path.startsWith("/marketing/leads/"),
  );

  // 3. Canais & Campanhas
  const canaisPaths = [
    "/marketing/email",
    "/marketing/whatsapp",
    "/marketing/criativos",
    "/marketing/calendario",
    "/marketing/utms",
    "/marketing/pixels",
  ];
  const canaisItems = items.filter((i) => canaisPaths.includes(i.path));

  // 4. Meta Ads & Redes
  const metaPaths = [
    "/marketing/meta-bm",
    "/marketing/meta-bm/campanhas",
    "/marketing/meta-bm/posts",
  ];
  const metaItems = items.filter((i) => metaPaths.includes(i.path));

  // 5. LinkTree
  const linktreePaths = [
    "/linktree/dashboard",
    "/linktree/empresa",
    "/linktree/tema",
  ];
  const linktreeItems = items.filter(
    (i) => linktreePaths.includes(i.path) || i.path.startsWith("/linktree/"),
  );

  const subGroups: NavSubGroup[] = [];
  if (analyticsItems.length)
    subGroups.push({ label: "Dashboard & Analytics", items: analyticsItems });
  if (capteItems.length)
    subGroups.push({ label: "Captação & Leads", items: capteItems });
  if (canaisItems.length)
    subGroups.push({ label: "Canais & Campanhas", items: canaisItems });
  if (metaItems.length)
    subGroups.push({ label: "Meta Ads & Redes", items: metaItems });
  if (linktreeItems.length)
    subGroups.push({ label: "LinkTree", items: linktreeItems });

  return subGroups;
}

function buildAdminSection(): NavModuleSection {
  const adminItems: NavItem[] = [
    { path: "/global/modulos", label: "Módulos ERP", icon: Puzzle },
  ];
  const infraItems: NavItem[] = [
    { path: "/global/banco", label: "Banco de Dados", icon: Database },
    { path: "/global/integracoes", label: "Integrações Nativas", icon: Cable },
    { path: "/global/acoes", label: "Central de Ações", icon: WebhookIcon },
  ];
  const ferramentasItems: NavItem[] = [
    { path: "/global/testes", label: "Central de Testes", icon: FileText },
    { path: "/global/diagnostico", label: "Diagnóstico", icon: Bug },
    { path: "/global/demos", label: "Credenciais Demos", icon: FlaskConical },
    {
      path: "/global/laboratorio",
      label: "Laboratório de Testes",
      icon: Beaker,
    },
    { path: "/global/modelos-ia", label: "Modelos de IA", icon: BrainCircuit },
    { path: "/global/agentes", label: "Agentes IA", icon: Bot },
    { path: "/global/limits", label: "Limites de Credenciais", icon: Shield },
    { path: "/global/manutencao", label: "Manutenção", icon: Wrench },
    { path: "/global/catalogo-links-teste", label: "Links de Teste - Catálogo", icon: Link2 },
    { path: "/empresa/onboarding", label: "Onboarding", icon: HelpCircle },
  ];
  const analyticsItems: NavItem[] = [
    { path: "/global/nps", label: "Dashboard NPS", icon: BarChart3 },
    { path: "/global/hub", label: "Dashboard Hub", icon: Globe },
    { path: "/empresa/hub/tema", label: "Temas Hub", icon: Palette },
  ];

  return {
    key: "__admin__",
    label: "Administração",
    icon: Shield,
    items: [
      ...adminItems,
      ...infraItems,
      ...ferramentasItems,
      ...analyticsItems,
    ],
    subGroups: [
      { label: "Gestão", items: adminItems },
      { label: "Infraestrutura", items: infraItems },
      { label: "Ferramentas", items: ferramentasItems },
      { label: "Analytics", items: analyticsItems },
    ],
  };
}

export function useNavItems(): NavModuleSection[] {
  const { profile, empresa, permissoes, modulosAcesso, modulosAtivos } = useAuth();
  const p = permissoes;

  const modulosAcessiveis = useMemo(() => {
    if (profile?.is_super_admin) {
      return getAllModules().map((m) => ({
        key: m.key,
        nome: m.nome,
        icon: m.icon,
      }));
    }
    const ativos = modulosAtivos || [];
    const isCompanyAdmin = profile?.role === "admin";
    const hasEmpresa = !!empresa?.id;
    return getAllModules()
      .filter((m) => {
        if (m.key === "empresas-core") {
          return isCompanyAdmin || modulosAcesso?.[m.key]?.acessar === true;
        }
        const temAcesso = modulosAcesso?.[m.key]?.acessar === true;
        if (!hasEmpresa) {
          return temAcesso;
        }
        return ativos.includes(m.key) && temAcesso;
      })
      .map((m) => ({ key: m.key, nome: m.nome, icon: m.icon }));
  }, [profile, modulosAtivos, modulosAcesso]);

  const MODULE_ORDER: Record<string, number> = {
    __admin__: 0,
    "empresas-core": 1,
    catalogo: 2,
    cadastros: 3,
    crm: 4,
    hub: 5,
    nps: 6,
    funis: 7,
    "mapas-interativos": 8,
    linktree: 9,
    "gerador-links": 10,
  };

  return useMemo(() => {
    const isSuper = profile?.is_super_admin === true;
    const isCompanyAdmin =
      !isSuper && profile?.role === "admin" && !!empresa?.id;
    const sections: NavModuleSection[] = [];

    // Administração (super admin only) — primeiro módulo
    if (isSuper) {
      sections.push(buildAdminSection());
    }

    // Empresas-core como "Configuração" — segundo módulo
    const hasEmpresasCore = modulosAcessiveis.some(
      (m) => m.key === "empresas-core",
    );
    if (hasEmpresasCore) {
      const configItems = filterRegistryItems(
        "empresas-core",
        isSuper,
        isCompanyAdmin,
        modulosAcesso,
      );

      // Manutenção: nav item controlado por role (não registrado no module.ts)
      const canAccessManutencao = isSuper || isCompanyAdmin;
      if (canAccessManutencao) {
        configItems.push({
          path: "/empresa/manutencao",
          label: "Manutenção",
          icon: Wrench,
        });
      }

      if (configItems.length > 0) {
        sections.push({
          key: "empresas-core",
          label: "Configuração",
          icon: Building2,
          items: configItems,
          subGroups: buildConfigSubGroups(configItems),
        });
      }
    }

    // Demais módulos
    const outros: NavModuleSection[] = [];
    for (const mod of modulosAcessiveis) {
      if (mod.key === "empresas-core") continue;

      const items = filterRegistryItems(
        mod.key,
        isSuper,
        isCompanyAdmin,
        modulosAcesso,
      );
      if (items.length === 0) continue;

      const section: NavModuleSection = {
        key: mod.key,
        label: mod.nome,
        icon: mod.icon,
        items,
      };

      if (mod.key === "hub") {
        section.subGroups = buildHubSubGroups(items);
      }

      if (mod.key === "marketing") {
        section.subGroups = buildMarketingSubGroups(items);
      }

      outros.push(section);
    }

    outros.sort(
      (a, b) => (MODULE_ORDER[a.key] ?? 99) - (MODULE_ORDER[b.key] ?? 99),
    );
    sections.push(...outros);

    return sections;
  }, [
    p,
    profile?.is_super_admin,
    profile?.role,
    empresa?.id,
    modulosAtivos,
    modulosAcesso,
    modulosAcessiveis,
  ]);
}

export function useModulos() {
  const { profile, empresa, modulosAtivos, modulosAcesso } = useAuth();
  return useMemo(() => {
    if (profile?.is_super_admin) {
      return getAllModules().map((m) => ({
        key: m.key,
        nome: m.nome,
        icon: m.icon,
      }));
    }
    const ativos = modulosAtivos || [];
    const isCompanyAdmin = profile?.role === "admin";
    const hasEmpresa = !!empresa?.id;
    return getAllModules()
      .filter((m) => {
        if (m.key === "empresas-core") {
          return isCompanyAdmin || modulosAcesso?.[m.key]?.acessar === true;
        }
        const temAcesso = modulosAcesso?.[m.key]?.acessar === true;
        if (!hasEmpresa) {
          return temAcesso;
        }
        return ativos.includes(m.key) && temAcesso;
      })
      .map((m) => ({
        key: m.key,
        nome: m.nome,
        icon: m.icon,
      }));
  }, [
    profile?.is_super_admin,
    profile?.role,
    empresa?.id,
    modulosAtivos,
    modulosAcesso,
  ]);
}
