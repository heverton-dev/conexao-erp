import { FileText } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { LANDING_PAGES_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { landingPagesDiagnosticPlan } from "./diagnostic";

export const landingPagesModule: ModuleDefinition = {
  key: "mktg-landing-pages",
  nome: "Landing Pages",
  descricao: "Criacao e gerenciamento de landing pages",
  icon: FileText,
  hasDesignConfig: true,
  hasDiagnostico: true,
  routes: ["/marketing/landing-pages"],
  permissions: LANDING_PAGES_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks do módulo" },
  ],
  events: [
    {
      key: "pagina.criada",
      label: "Página Criada",
      descricao: "Quando uma landing page é criada",
      type: "status_change",
    },
    {
      key: "pagina.publicada",
      label: "Página Publicada",
      descricao: "Quando uma landing page é publicada",
      type: "button_action",
    },
    {
      key: "pagina.visitante",
      label: "Visitante na Página",
      descricao: "Quando um visitante acessa a landing page",
      type: "status_change",
    },
  ],
  setup: () => {
    registrarPlanoDiagnostico(landingPagesDiagnosticPlan);
    for (const p of LANDING_PAGES_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-landing-pages",
      label: "Landing Pages",
      icon: FileText,
      to: "/marketing/landing-pages",
      permissionCheck: (perms) => perms?.mktg_lp_ver === true,
      order: 20,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-landing-pages", {
      cadastro: {
        mktg_lp_ver: true,
        mktg_lp_criar: true,
        mktg_lp_editar: true,
        mktg_lp_excluir: true,
        mktg_lp_publicar: true,
      },
      tecnologia: {
        mktg_lp_ver: true,
        mktg_lp_criar: true,
        mktg_lp_editar: true,
        mktg_lp_excluir: true,
        mktg_lp_publicar: true,
      },
      consultor: {
        mktg_lp_ver: false,
        mktg_lp_criar: false,
        mktg_lp_editar: false,
        mktg_lp_excluir: false,
        mktg_lp_publicar: false,
      },
      suporte: {
        mktg_lp_ver: false,
        mktg_lp_criar: false,
        mktg_lp_editar: false,
        mktg_lp_excluir: false,
        mktg_lp_publicar: false,
      },
    });
  },
};
