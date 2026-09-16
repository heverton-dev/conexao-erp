import { Search } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { SEO_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { seoDiagnosticPlan } from "./diagnostic";

export const seoModule: ModuleDefinition = {
  key: "mktg-seo",
  nome: "SEO",
  descricao: "Auditoria e otimizacao SEO",
  icon: Search,
  routes: ["/marketing/seo"],
  permissions: SEO_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [],
  events: [],
  hasDiagnostico: true,
  setup: () => {
    registrarPlanoDiagnostico(seoDiagnosticPlan);
    for (const p of SEO_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-seo",
      label: "SEO",
      icon: Search,
      to: "/marketing/seo",
      permissionCheck: (perms) => perms?.mktg_seo_ver === true,
      order: 80,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-seo", {
      cadastro: { mktg_seo_ver: true, mktg_seo_auditar: true },
      tecnologia: { mktg_seo_ver: true, mktg_seo_auditar: true },
      consultor: { mktg_seo_ver: false, mktg_seo_auditar: false },
      suporte: { mktg_seo_ver: false, mktg_seo_auditar: false },
    });
  },
};
