import {
  Route,
  MapPin,
  Upload,
  BarChart3,
  Palette,
  FileText,
} from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { ROTAS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { rotasDiagnosticPlan } from "./diagnostic";

export const rotasModule: ModuleDefinition = {
  key: "rotas",
  nome: "Rotas de Visitas",
  descricao: "Planejamento e execução de rotas de visitas a clientes",
  icon: Route,
  routes: ["/rotas", "/rotas/$id", "/rotas/design"],
  permissions: ROTAS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor", "tecnologia"],
  abas: [
    {
      key: "geral",
      label: "Geral",
      descricao: "Configurações gerais do módulo",
    },
    {
      key: "permissoes",
      label: "Permissões",
      descricao: "Gerenciar permissões do módulo",
    },
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos e webhooks do módulo",
    },
  ],
  events: [
    {
      key: "rota.criada",
      label: "Rota Criada",
      descricao: "Quando uma nova rota é planejada",
      type: "status_change",
    },
    {
      key: "rota.iniciada",
      label: "Rota Iniciada",
      descricao: "Quando o consultor inicia a execução da rota",
      type: "button_action",
    },
    {
      key: "rota.finalizada",
      label: "Rota Finalizada",
      descricao: "Quando a rota é concluída",
      type: "status_change",
    },
    {
      key: "visita.registrada",
      label: "Visita Registrada",
      descricao: "Quando uma visita é finalizada",
      type: "button_action",
    },
  ],
  hasDesignConfig: true,
  designRoute: "/empresa/rotas/design",
  hasDiagnostico: true,
  setup: () => {
    registrarPlanoDiagnostico(rotasDiagnosticPlan);
    for (const p of ROTAS_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "rotas",
      label: "Rotas",
      icon: Route,
      to: "/rotas",
      noChildMatch: true,
      permissionCheck: (perms) =>
        perms?.rotas_planejar === true || perms?.rotas_executar === true,
      order: 30,
      moduloKey: "rotas",
    });

    const rotasAllTrue = {
      rotas_planejar: true,
      rotas_executar: true,
      rotas_configurar: true,
      rotas_upload_base: true,
      rotas_ver_relatorios: true,
      rotas_form_config: true,
    };
    const rotasAllFalse = Object.fromEntries(
      Object.keys(rotasAllTrue).map((k) => [k, false]),
    );

    registerPermissionDefaults("rotas", {
      cadastro: rotasAllTrue,
      consultor: {
        ...rotasAllFalse,
        rotas_planejar: true,
        rotas_executar: true,
        rotas_ver_relatorios: true,
      },
      tecnologia: rotasAllTrue,
      suporte: rotasAllFalse,
    });
  },
};
