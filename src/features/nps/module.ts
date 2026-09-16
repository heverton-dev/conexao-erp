import { ClipboardCheck, Settings, FileText, Eye, Palette } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { NPS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { npsDiagnosticPlan } from "./diagnostic";

export const npsModule: ModuleDefinition = {
  key: "nps",
  nome: "NPS",
  descricao: "Pesquisas de satisfação e Net Promoter Score",
  icon: ClipboardCheck,
  routes: [
    "/nps",
    "/nps/survey",
    "/nps/dashboard",
    "/nps/pesquisas",
    "/nps/preview",
    "/nps/relatorios",
  ],
  permissions: NPS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor", "tecnologia"],
  abas: [
    { key: "geral", label: "Geral", descricao: "Configurações gerais do NPS" },
    {
      key: "permissoes",
      label: "Permissões",
      descricao: "Gerenciar permissões do módulo",
    },
    {
      key: "credenciais",
      label: "Credenciais",
      descricao: "Credenciais com escopo no NPS",
    },
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos e webhooks do NPS",
    },
  ],
  events: [
    {
      key: "nps.resposta_recebida",
      label: "Resposta Recebida",
      descricao: "Dispara quando uma resposta é submetida",
      type: "status_change",
    },
    {
      key: "nps.detrator_detectado",
      label: "Detrator Detectado",
      descricao: "Dispara quando nota NPS ≤ 6",
      type: "status_change",
    },
    {
      key: "nps.pesquisa_enviada",
      label: "Pesquisa Enviada",
      descricao: "Dispara quando pesquisas são disparadas",
      type: "button_action",
    },
  ],
  hasDiagnostico: true,
  hasCredentialScopes: true,
  hasDesignConfig: true,
  designRoute: "/empresa/nps/design",
  setup: () => {
    registrarPlanoDiagnostico(npsDiagnosticPlan);
    for (const p of NPS_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "nps-dashboard",
      label: "Dashboard NPS",
      icon: ClipboardCheck,
      to: "/nps/dashboard",
      permissionCheck: (perms) => perms?.nps_ver_dashboard === true,
      order: 15,
      moduloKey: "nps",
    });

    registerNavItem({
      id: "nps-pesquisas",
      label: "Gerenciar Perguntas",
      icon: Settings,
      to: "/nps/pesquisas",
      permissionCheck: (perms) => perms?.nps_gerenciar_perguntas === true,
      order: 16,
      moduloKey: "nps",
    });

    registerNavItem({
      id: "nps-relatorios",
      label: "Relatórios Envio",
      icon: FileText,
      to: "/nps/relatorios",
      permissionCheck: (perms) => perms?.nps_ver_relatorios === true,
      order: 17,
      moduloKey: "nps",
    });

    registerNavItem({
      id: "nps-preview",
      label: "Preview da Pesquisa",
      icon: Eye,
      to: "/nps/preview",
      permissionCheck: (perms) => perms?.nps_gerenciar_perguntas === true,
      order: 18,
      moduloKey: "nps",
    });

    registerPermissionDefaults("nps", {
      cadastro: {
        nps_ver_dashboard: true,
        nps_ver_respostas: true,
        nps_gerenciar_perguntas: true,
        nps_gerenciar_webhooks: false,
        nps_excluir_respostas: false,
        nps_ver_relatorios: true,
        nps_exportar_dados: true,
      },
      consultor: {
        nps_ver_dashboard: false,
        nps_ver_respostas: false,
        nps_gerenciar_perguntas: false,
        nps_gerenciar_webhooks: false,
        nps_excluir_respostas: false,
        nps_ver_relatorios: false,
        nps_exportar_dados: false,
      },
      tecnologia: {
        nps_ver_dashboard: true,
        nps_ver_respostas: true,
        nps_gerenciar_perguntas: true,
        nps_gerenciar_webhooks: true,
        nps_excluir_respostas: true,
        nps_ver_relatorios: true,
        nps_exportar_dados: true,
      },
      suporte: {
        nps_ver_dashboard: false,
        nps_ver_respostas: false,
        nps_gerenciar_perguntas: false,
        nps_gerenciar_webhooks: false,
        nps_excluir_respostas: false,
        nps_ver_relatorios: false,
        nps_exportar_dados: false,
      },
    });
  },
};
