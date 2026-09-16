import { Calendar } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { CALENDARIO_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { calendarioDiagnosticPlan } from "./diagnostic";

export const calendarioModule: ModuleDefinition = {
  key: "mktg-calendario",
  nome: "Calendario Editorial",
  descricao: "Planejamento editorial e agendamento",
  icon: Calendar,
  routes: ["/marketing/calendario"],
  permissions: CALENDARIO_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [],
  events: [],
  hasDiagnostico: true,
  setup: () => {
    registrarPlanoDiagnostico(calendarioDiagnosticPlan);
    for (const p of CALENDARIO_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-calendario",
      label: "Calendario",
      icon: Calendar,
      to: "/marketing/calendario",
      permissionCheck: (perms) => perms?.mktg_cal_ver === true,
      order: 90,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-calendario", {
      cadastro: { mktg_cal_ver: true, mktg_cal_criar: true, mktg_cal_editar: true, mktg_cal_excluir: true },
      tecnologia: { mktg_cal_ver: true, mktg_cal_criar: true, mktg_cal_editar: true, mktg_cal_excluir: true },
      consultor: { mktg_cal_ver: false, mktg_cal_criar: false, mktg_cal_editar: false, mktg_cal_excluir: false },
      suporte: { mktg_cal_ver: false, mktg_cal_criar: false, mktg_cal_editar: false, mktg_cal_excluir: false },
    });
  },
};
