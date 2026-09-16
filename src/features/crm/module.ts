import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  ArrowLeftRight,
  Crown,
  Palette,
  Kanban,
  ListTodo,
} from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { CRM_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { crmDiagnosticPlan } from "./diagnostic";

export const crmModule: ModuleDefinition = {
  key: "crm",
  nome: "CRM",
  descricao: "Gestão de relacionamento com clientes e equipe comercial",
  icon: Users,
  routes: [
    "/crm/dashboard",
    "/crm/carteira",
    "/crm/pipeline",
    "/crm/tarefas",
    "/crm/metricas",
    "/crm/cliente/$id",
    "/crm/equipe",
    "/crm/bi",
    "/crm/transferencia",
    "/crm/transferencia/consultores",
    "/crm/diretoria",
    "/crm/diretoria/gestor/$id",
    "/crm/aceitar-convite/$token",
  ],
  permissions: CRM_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor", "tecnologia"],
  abas: [
    { key: "geral", label: "Geral", descricao: "Configurações gerais do CRM" },
    {
      key: "permissoes",
      label: "Permissões",
      descricao: "Gerenciar permissões do módulo",
    },
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos e webhooks do CRM",
    },
  ],
  events: [
    {
      key: "cliente.criado",
      label: "Cliente Criado",
      descricao: "Quando um novo cliente é adicionado",
      type: "status_change",
    },
    {
      key: "cliente.transferido",
      label: "Cliente Transferido",
      descricao: "Quando um cliente é transferido",
      type: "status_change",
    },
    {
      key: "visita.realizada",
      label: "Visita Realizada",
      descricao: "Quando uma visita é registrada",
      type: "button_action",
    },
    {
      key: "tarefa.excluida",
      label: "Tarefa Excluída",
      descricao: "Quando uma tarefa é excluída",
      type: "button_action",
    },
    {
      key: "consultor.transferido",
      label: "Consultor Transferido",
      descricao: "Quando um consultor é transferido entre gestores",
      type: "status_change",
    },
  ],
  hasDiagnostico: true,
  hasDesignConfig: true,
  designRoute: "/empresa/crm/design",
  setup: () => {
    registrarPlanoDiagnostico(crmDiagnosticPlan);
    for (const p of CRM_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "crm-dashboard",
      label: "Dashboard CRM",
      icon: LayoutDashboard,
      to: "/crm/dashboard",
      permissionCheck: (perms) => perms?.crm_dashboard === true,
      order: 50,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-carteira",
      label: "Carteira",
      icon: Users,
      to: "/crm/carteira",
      permissionCheck: (perms) => perms?.crm_carteira === true,
      order: 51,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-pipeline",
      label: "Pipeline",
      icon: Kanban,
      to: "/crm/pipeline",
      permissionCheck: (perms) => perms?.crm_pipeline === true,
      order: 52,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-tarefas",
      label: "Tarefas",
      icon: ListTodo,
      to: "/crm/tarefas",
      permissionCheck: (perms) => perms?.crm_tarefas === true,
      order: 53,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-equipe",
      label: "Equipe",
      icon: UserCheck,
      to: "/crm/equipe",
      permissionCheck: (perms) => perms?.crm_equipe === true,
      order: 54,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-metricas",
      label: "Métricas",
      icon: BarChart3,
      to: "/crm/metricas",
      permissionCheck: (perms) => perms?.crm_metricas === true,
      order: 55,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-bi",
      label: "BI",
      icon: BarChart3,
      to: "/crm/bi",
      permissionCheck: (perms) => perms?.crm_bi === true,
      order: 56,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-transferencia",
      label: "Transferência",
      icon: ArrowLeftRight,
      to: "/crm/transferencia",
      permissionCheck: (perms) => perms?.crm_transferencia === true,
      order: 54,
      moduloKey: "crm",
    });

    registerNavItem({
      id: "crm-diretoria",
      label: "Diretoria",
      icon: Crown,
      to: "/crm/diretoria",
      permissionCheck: (perms) => perms?.crm_diretoria === true,
      order: 55,
      moduloKey: "crm",
    });

    const crmAllTrue = {
      crm_dashboard: true,
      crm_carteira: true,
      crm_pipeline: true,
      crm_tarefas: true,
      crm_metricas: true,
      crm_cliente_detalhe: true,
      crm_equipe: true,
      crm_bi: true,
      crm_transferencia: true,
      crm_diretoria: true,
    };
    const crmAllFalse = Object.fromEntries(
      Object.keys(crmAllTrue).map((k) => [k, false]),
    );

    registerPermissionDefaults("crm", {
      cadastro: crmAllTrue,
      consultor: {
        ...crmAllFalse,
        crm_dashboard: true,
        crm_carteira: true,
        crm_pipeline: true,
        crm_tarefas: true,
        crm_cliente_detalhe: true,
        crm_equipe: true,
      },
      tecnologia: crmAllTrue,
      suporte: crmAllFalse,
    });
  },
};
