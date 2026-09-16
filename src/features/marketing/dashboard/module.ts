import { BarChart3 } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { DASHBOARD_PERMISSIONS } from "./permissions";

export const dashboardModule: ModuleDefinition = {
  key: "mktg-dashboard",
  nome: "Dashboard Marketing",
  descricao: "Visao geral com metricas e graficos",
  icon: BarChart3,
  routes: ["/marketing/dashboard"],
  permissions: DASHBOARD_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [],
  events: [],
  setup: () => {
    for (const p of DASHBOARD_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-dashboard",
      label: "Dashboard",
      icon: BarChart3,
      to: "/marketing/dashboard",
      permissionCheck: (perms) => perms?.mktg_dashboard_ver === true,
      order: 10,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-dashboard", {
      cadastro: { mktg_dashboard_ver: true },
      tecnologia: { mktg_dashboard_ver: true },
      consultor: { mktg_dashboard_ver: false },
      suporte: { mktg_dashboard_ver: false },
    });
  },
};
