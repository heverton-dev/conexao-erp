import { Crosshair } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { PIXELS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { pixelsDiagnosticPlan } from "./diagnostic";

export const pixelsModule: ModuleDefinition = {
  key: "mktg-pixels",
  nome: "Pixels",
  descricao: "Gerenciamento de pixels de rastreamento",
  icon: Crosshair,
  routes: ["/marketing/pixels"],
  permissions: PIXELS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks do módulo" },
  ],
  events: [
    {
      key: "evento.registrado",
      label: "Evento Registrado",
      descricao: "Quando um evento de pixel é registrado",
      type: "status_change",
    },
    {
      key: "conversao.registrada",
      label: "Conversão Registrada",
      descricao: "Quando uma conversão é registrada pelo pixel",
      type: "status_change",
    },
  ],
  hasDiagnostico: true,
  setup: () => {
    registrarPlanoDiagnostico(pixelsDiagnosticPlan);
    for (const p of PIXELS_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-pixels",
      label: "Pixels",
      icon: Crosshair,
      to: "/marketing/pixels",
      permissionCheck: (perms) => perms?.mktg_pixel_ver === true,
      order: 110,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-pixels", {
      cadastro: { mktg_pixel_ver: true, mktg_pixel_criar: true, mktg_pixel_editar: true, mktg_pixel_excluir: true },
      tecnologia: { mktg_pixel_ver: true, mktg_pixel_criar: true, mktg_pixel_editar: true, mktg_pixel_excluir: true },
      consultor: { mktg_pixel_ver: false, mktg_pixel_criar: false, mktg_pixel_editar: false, mktg_pixel_excluir: false },
      suporte: { mktg_pixel_ver: false, mktg_pixel_criar: false, mktg_pixel_editar: false, mktg_pixel_excluir: false },
    });
  },
};
