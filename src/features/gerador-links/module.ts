import {
  BarChart3,
  History,
  LayoutTemplate,
  Link,
  MapPin,
  MessageCircle,
  Navigation,
  QrCode,
  Star,
} from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { GERADOR_LINKS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { geradorLinksDiagnosticPlan } from "./diagnostic";

export const geradorLinksModule: ModuleDefinition = {
  key: "gerador-links",
  nome: "Links",
  descricao: "Geração de links personalizados: WhatsApp, UTMs, Google Review, Maps, Waze e QR Code",
  icon: Link,
  routes: [
    "/ferramentas/links",
    "/ferramentas/links/historico",
    "/ferramentas/links/templates",
    "/ferramentas/links/whatsapp",
    "/ferramentas/links/utm",
    "/ferramentas/links/google-review",
    "/ferramentas/links/maps",
    "/ferramentas/links/waze",
    "/ferramentas/links/qrcode",
  ],
  permissions: GERADOR_LINKS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks do módulo" },
  ],
  events: [
    {
      key: "link.gerado_whatsapp",
      label: "Link WhatsApp Gerado",
      descricao: "Quando um link do WhatsApp é gerado",
      type: "button_action",
    },
    {
      key: "link.gerado_qrcode",
      label: "QR Code Gerado",
      descricao: "Quando um QR Code é gerado",
      type: "button_action",
    },
    {
      key: "link.clicado",
      label: "Link Clicado",
      descricao: "Quando um link gerado é clicado (tracking)",
      type: "status_change",
    },
  ],
  hasDiagnostico: true,
  setup: () => {
    registrarPlanoDiagnostico(geradorLinksDiagnosticPlan);
    for (const p of GERADOR_LINKS_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });

    registerNavItem({
      id: "gerador-links-dashboard",
      label: "Dashboard",
      icon: BarChart3,
      to: "/ferramentas/links",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_ver === true,
      order: 10,
      noChildMatch: true,
    });

    registerNavItem({
      id: "gerador-links-historico",
      label: "Histórico",
      icon: History,
      to: "/ferramentas/links/historico",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_ver === true,
      order: 15,
    });

    registerNavItem({
      id: "gerador-links-templates",
      label: "Templates",
      icon: LayoutTemplate,
      to: "/ferramentas/links/templates",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_gerenciar_templates === true,
      order: 16,
    });

    registerNavItem({
      id: "gerador-links-whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      to: "/ferramentas/links/whatsapp",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_gerar === true,
      order: 20,
    });

    registerNavItem({
      id: "gerador-links-utm",
      label: "UTM",
      icon: Link,
      to: "/ferramentas/links/utm",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_gerar === true,
      order: 30,
    });

    registerNavItem({
      id: "gerador-links-google-review",
      label: "Google Review",
      icon: Star,
      to: "/ferramentas/links/google-review",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_gerar === true,
      order: 40,
    });

    registerNavItem({
      id: "gerador-links-maps",
      label: "Google Maps",
      icon: MapPin,
      to: "/ferramentas/links/maps",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_gerar === true,
      order: 50,
    });

    registerNavItem({
      id: "gerador-links-waze",
      label: "Waze",
      icon: Navigation,
      to: "/ferramentas/links/waze",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_gerar === true,
      order: 60,
    });

    registerNavItem({
      id: "gerador-links-qrcode",
      label: "QR Code",
      icon: QrCode,
      to: "/ferramentas/links/qrcode",
      moduloKey: "gerador-links",
      permissionCheck: (perms) => perms?.lk_gerar === true,
      order: 70,
    });

    registerPermissionDefaults("gerador-links", {
      cadastro: { lk_ver: true, lk_gerar: true, lk_salvar: true, lk_editar: true, lk_excluir: true, lk_gerenciar_templates: true },
      tecnologia: { lk_ver: true, lk_gerar: true, lk_salvar: true, lk_editar: true, lk_excluir: true, lk_gerenciar_templates: true },
      consultor: { lk_ver: true, lk_gerar: true, lk_salvar: false, lk_editar: false, lk_excluir: false, lk_gerenciar_templates: false },
      suporte: { lk_ver: false, lk_gerar: false, lk_salvar: false, lk_editar: false, lk_excluir: false, lk_gerenciar_templates: false },
    });
  },
};
