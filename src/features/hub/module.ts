import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Trophy,
  Settings,
  Users,
  BarChart3,
  Bot,
  FileText,
  Medal,
  Star,
  Palette,
} from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { HUB_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { hubDiagnosticPlan } from "./diagnostic";

export const hubModule: ModuleDefinition = {
  key: "hub",
  nome: "Hub",
  descricao: "Plataforma de treinamento e gamificação",
  icon: BookOpen,
  routes: [
    "/global/hub",
    "/empresa/hub/tema",
    "/hub/admin/dashboard",
    "/hub/admin/materiais",
    "/hub/admin/trilhas",
    "/hub/admin/analytics",
    "/hub/admin/badges",
    "/empresa/hub/chatbot",
    "/hub/gestor/dashboard",
    "/hub/gestor/analytics",
    "/hub/gestor/ranking",
    "/hub/gestor/conquistas",
    "/hub/consultor/dashboard",
    "/hub/consultor/ranking",
    "/hub/consultor/conquistas",
    "/hub/distribuidor/dashboard",
    "/hub/distribuidor/conquistas",
    "/hub/cliente/dashboard/$empresaId",
  ],
  permissions: HUB_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor", "tecnologia"],
  abas: [
    { key: "geral", label: "Geral", descricao: "Configurações gerais do Hub" },
    {
      key: "permissoes",
      label: "Permissões",
      descricao: "Gerenciar permissões do módulo",
    },
    {
      key: "credenciais",
      label: "Credenciais",
      descricao: "Credenciais com escopo no Hub",
    },
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos e webhooks do Hub",
    },
    {
      key: "integracoes",
      label: "Integrações",
      descricao: "Integrações AI do Hub",
    },
    { key: "chatbot", label: "Chatbot", descricao: "Configuração do chatbot" },
  ],
  events: [
    {
      key: "material.acessado",
      label: "Material Acessado",
      descricao: "Quando um material é visualizado",
      type: "status_change",
    },
    {
      key: "material.concluido",
      label: "Material Concluído",
      descricao: "Quando um material é concluído",
      type: "status_change",
    },
    {
      key: "trilha.concluida",
      label: "Trilha Concluída",
      descricao: "Quando uma trilha é concluída",
      type: "status_change",
    },
    {
      key: "gamification.level_up",
      label: "Level Up",
      descricao: "Quando um usuário sobe de nível",
      type: "status_change",
    },
    {
      key: "badge.conquistado",
      label: "Badge Conquistado",
      descricao: "Quando um badge é desbloqueado",
      type: "status_change",
    },
    {
      key: "convite.gerado",
      label: "Convite Gerado",
      descricao: "Quando um convite é criado",
      type: "button_action",
    },
    {
      key: "usuario.registrado",
      label: "Usuário Registrado",
      descricao: "Quando um usuário se registra via convite",
      type: "status_change",
    },
    {
      key: "usuario.status_alterado",
      label: "Status Alterado",
      descricao: "Quando status do usuário muda",
      type: "status_change",
    },
  ],
  hasDiagnostico: true,
  hasCredentialScopes: true,
  hasDesignConfig: true,
  designRoute: "/empresa/hub/design",
  setup: () => {
    registrarPlanoDiagnostico(hubDiagnosticPlan);
    for (const p of HUB_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    const isAdmin = (perms: any) => perms?.hub_gerenciar_config === true;
    const isGestor = (perms: any) =>
      perms?.hub_ver_analytics === true && perms?.hub_gerenciar_config !== true;
    const isConsultor = (perms: any) =>
      perms?.hub_ver_materiais === true &&
      perms?.hub_gerenciar_config !== true &&
      perms?.hub_ver_analytics !== true;
    const isDistribuidor = (perms: any) =>
      perms?.hub_ver_materiais === true &&
      perms?.hub_gerenciar_config !== true &&
      perms?.hub_ver_analytics !== true;

    registerNavItem({
      id: "hub-admin-dashboard",
      label: "Dash Admin",
      icon: LayoutDashboard,
      to: "/hub/admin/dashboard",
      permissionCheck: isAdmin,
      order: 25,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-admin-materiais",
      label: "Add Materiais",
      icon: FileText,
      to: "/hub/admin/materiais",
      permissionCheck: isAdmin,
      order: 26,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-admin-trilhas",
      label: "Add Trilhas",
      icon: GraduationCap,
      to: "/hub/admin/trilhas",
      permissionCheck: isAdmin,
      order: 27,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-admin-badges",
      label: "Add Badges",
      icon: Trophy,
      to: "/hub/admin/badges",
      permissionCheck: isAdmin,
      order: 28,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-admin-analytics",
      label: "BI Admin",
      icon: BarChart3,
      to: "/hub/admin/analytics",
      permissionCheck: isAdmin,
      order: 29,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-admin-chatbot",
      label: "Config. Chatbot",
      icon: Bot,
      to: "/hub/admin/chatbot",
      permissionCheck: isAdmin,
      order: 30,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-gestor-dashboard",
      label: "Dash Gestor",
      icon: LayoutDashboard,
      to: "/hub/gestor/dashboard",
      permissionCheck: isGestor,
      order: 35,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-gestor-analytics",
      label: "BI Gestor",
      icon: BarChart3,
      to: "/hub/gestor/analytics",
      permissionCheck: isGestor,
      order: 36,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-gestor-ranking",
      label: "Rank Gestor",
      icon: Medal,
      to: "/hub/gestor/ranking",
      permissionCheck: isGestor,
      order: 37,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-gestor-conquistas",
      label: "Badges Gestor",
      icon: Star,
      to: "/hub/gestor/conquistas",
      permissionCheck: isGestor,
      order: 38,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-consultor-dashboard",
      label: "Dash Consultor",
      icon: LayoutDashboard,
      to: "/hub/consultor/dashboard",
      permissionCheck: isConsultor,
      order: 45,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-consultor-ranking",
      label: "Rank Consultor",
      icon: Medal,
      to: "/hub/consultor/ranking",
      permissionCheck: isConsultor,
      order: 46,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-consultor-conquistas",
      label: "Badges Consultor",
      icon: Star,
      to: "/hub/consultor/conquistas",
      permissionCheck: isConsultor,
      order: 47,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-distribuidor-dashboard",
      label: "Dash Distribuidor",
      icon: LayoutDashboard,
      to: "/hub/distribuidor/dashboard",
      permissionCheck: isDistribuidor,
      order: 55,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-distribuidor-conquistas",
      label: "Badges Distribuidor",
      icon: Star,
      to: "/hub/distribuidor/conquistas",
      permissionCheck: isDistribuidor,
      order: 56,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-global-dashboard",
      label: "Hub",
      icon: BookOpen,
      to: "/global/hub",
      permissionCheck: (perms: any) => perms?.hub_ver_materiais === true,
      order: 60,
      moduloKey: "hub",
    });

    registerNavItem({
      id: "hub-empresa-tema",
      label: "Temas Hub",
      icon: Settings,
      to: "/empresa/hub/tema",
      permissionCheck: isAdmin,
      order: 61,
      moduloKey: "hub",
    });

    const hubAllTrue = {
      hub_ver_materiais: true,
      hub_criar_material: true,
      hub_editar_material: true,
      hub_excluir_material: true,
      hub_gerenciar_assets: true,
      hub_publicar_material: true,
      hub_ver_acessos_material: true,
      hub_exportar_materiais: true,
      hub_ver_trilhas: true,
      hub_criar_trilha: true,
      hub_editar_trilha: true,
      hub_excluir_trilha: true,
      hub_gerenciar_itens_trilha: true,
      hub_compartilhar_trilha: true,
      hub_ver_ranking: true,
      hub_gerenciar_badges: true,
      hub_gerenciar_niveis: true,
      hub_ver_conquistas: true,
      hub_ver_usuarios: true,
      hub_editar_usuario: true,
      hub_aprovar_usuario: true,
      hub_gerenciar_convites: true,
      hub_ver_analytics: true,
      hub_gerenciar_config: true,
      hub_gerenciar_integracoes: true,
      hub_gerenciar_chatbot: true,
      hub_gerenciar_webhooks_hub: true,
    };
    const hubAllFalse = Object.fromEntries(
      Object.keys(hubAllTrue).map((k) => [k, false]),
    );

    registerPermissionDefaults("hub", {
      cadastro: hubAllTrue,
      consultor: {
        ...hubAllFalse,
        hub_ver_materiais: true,
        hub_ver_ranking: true,
        hub_ver_conquistas: true,
      },
      tecnologia: hubAllTrue,
      suporte: hubAllFalse,
    });
  },
};
