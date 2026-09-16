import { Link2 } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { UTMS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { utmsDiagnosticPlan } from "./diagnostic";

export const utmsModule: ModuleDefinition = {
  key: "mktg-utms",
  nome: "UTMs",
  descricao: "Gerador e historico de UTMs",
  icon: Link2,
  routes: ["/marketing/utms"],
  permissions: UTMS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [],
  events: [],
  hasDiagnostico: true,
  setup: () => {
    registrarPlanoDiagnostico(utmsDiagnosticPlan);
    for (const p of UTMS_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-utms",
      label: "UTMs",
      icon: Link2,
      to: "/marketing/utms",
      permissionCheck: (perms) => perms?.mktg_utm_ver === true,
      order: 50,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-utms", {
      cadastro: { mktg_utm_ver: true, mktg_utm_criar: true, mktg_utm_editar: true, mktg_utm_excluir: true },
      tecnologia: { mktg_utm_ver: true, mktg_utm_criar: true, mktg_utm_editar: true, mktg_utm_excluir: true },
      consultor: { mktg_utm_ver: false, mktg_utm_criar: false, mktg_utm_editar: false, mktg_utm_excluir: false },
      suporte: { mktg_utm_ver: false, mktg_utm_criar: false, mktg_utm_editar: false, mktg_utm_excluir: false },
    });
  },
};
