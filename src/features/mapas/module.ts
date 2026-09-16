import {
  Map,
  Building2,
  UserCircle,
  BarChart3,
  Globe,
  Palette,
} from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { MAPAS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { mapasDiagnosticPlan } from "./diagnostic";

export const mapasModule: ModuleDefinition = {
  key: "mapas-interativos",
  nome: "Mapas",
  descricao: "Mapas interativos de presença comercial",
  icon: Map,
  routes: [
    "/mapas",
    "/mapas/distribuidores",
    "/mapas/consultores",
    "/mapas/gestao",
    "/mapas/insights",
    "/mapas/gestao/distribuidores",
    "/mapas/gestao/consultores",
  ],
  permissions: MAPAS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor"],
  abas: [
    { key: "geral", label: "Geral" },
    { key: "permissoes", label: "Permissões" },
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks do módulo" },
  ],
  events: [
    {
      key: "mapas.distribuidor.criado",
      label: "Distribuidor Criado",
      descricao: "Dispara quando um novo distribuidor é adicionado",
      type: "status_change",
    },
    {
      key: "mapas.distribuidor.atualizado",
      label: "Distribuidor Atualizado",
      descricao: "Dispara quando um distribuidor é editado",
      type: "status_change",
    },
    {
      key: "mapas.distribuidor.excluido",
      label: "Distribuidor Excluído",
      descricao: "Dispara quando um distribuidor é removido",
      type: "status_change",
    },
    {
      key: "mapas.consultor.criado",
      label: "Consultor Criado",
      descricao: "Dispara quando um novo consultor é adicionado",
      type: "status_change",
    },
    {
      key: "mapas.consultor.atualizado",
      label: "Consultor Atualizado",
      descricao: "Dispara quando um consultor é editado",
      type: "status_change",
    },
    {
      key: "mapas.consultor.excluido",
      label: "Consultor Excluído",
      descricao: "Dispara quando um consultor é removido",
      type: "status_change",
    },
    {
      key: "mapas.estado.clicado",
      label: "Estado Clicado",
      descricao: "Dispara quando um estado é clicado no mapa",
      type: "button_action",
    },
    {
      key: "mapas.pin.clicado",
      label: "Pin Clicado",
      descricao: "Dispara quando um pin é clicado no mapa",
      type: "button_action",
    },
  ],
  hasDiagnostico: true,
  hasDesignConfig: true,
  designRoute: "/empresa/mapas/design",
  setup: () => {
    registrarPlanoDiagnostico(mapasDiagnosticPlan);
    for (const p of MAPAS_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "mapas-publico",
      label: "Mapa de Presença",
      icon: Map,
      to: "/mapas",
      permissionCheck: (perms) => perms?.mapas_ver_mapa_publico === true,
      order: 10,
      moduloKey: "mapas-interativos",
      noChildMatch: true,
      matchPaths: ["/mapas/distribuidores", "/mapas/consultores"],
    });

    registerNavItem({
      id: "mapas-admin-distribuidores",
      label: "Distribuidores",
      icon: Building2,
      to: "/mapas/gestao/distribuidores",
      permissionCheck: (perms) => perms?.mapas_gerir_distribuidores === true,
      order: 20,
      moduloKey: "mapas-interativos",
    });

    registerNavItem({
      id: "mapas-admin-consultores",
      label: "Consultores",
      icon: UserCircle,
      to: "/mapas/gestao/consultores",
      permissionCheck: (perms) => perms?.mapas_gerir_consultores === true,
      order: 30,
      moduloKey: "mapas-interativos",
    });

    registerNavItem({
      id: "mapas-admin-insights",
      label: "Insights",
      icon: BarChart3,
      to: "/mapas/insights",
      permissionCheck: (perms) => perms?.mapas_ver_insights === true,
      order: 40,
      moduloKey: "mapas-interativos",
    });

    registerPermissionDefaults("mapas-interativos", {
      cadastro: {
        mapas_ver_mapa_publico: true,
        mapas_gerir_distribuidores: true,
        mapas_gerir_consultores: true,
        mapas_ver_insights: true,
      },
      consultor: {
        mapas_ver_mapa_publico: true,
        mapas_gerir_distribuidores: false,
        mapas_gerir_consultores: false,
        mapas_ver_insights: false,
      },
      tecnologia: {
        mapas_ver_mapa_publico: true,
        mapas_gerir_distribuidores: true,
        mapas_gerir_consultores: true,
        mapas_ver_insights: true,
      },
      suporte: {
        mapas_ver_mapa_publico: false,
        mapas_gerir_distribuidores: false,
        mapas_gerir_consultores: false,
        mapas_ver_insights: false,
      },
    });
  },
};
