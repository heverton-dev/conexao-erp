import { Globe } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { META_BM_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { metaBmDiagnosticPlan } from "./diagnostic";

export const metaBmModule: ModuleDefinition = {
  key: "mktg-meta-bm",
  nome: "Meta Business Manager",
  descricao: "Integração com Facebook/Meta para gestão de campanhas e posts",
  icon: Globe,
  routes: [
    "/marketing/meta-bm",
    "/marketing/meta-bm/campanhas",
    "/marketing/meta-bm/posts",
  ],
  permissions: META_BM_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    {
      key: "geral",
      label: "Geral",
      descricao: "Configurações gerais do Meta BM",
    },
    {
      key: "permissoes",
      label: "Permissões",
      descricao: "Gerenciar permissões do módulo",
    },
    {
      key: "credenciais",
      label: "Credenciais",
      descricao: "Credenciais com escopo no módulo",
    },
  ],
  events: [],
  hasDiagnostico: true,
  hasCredentialScopes: true,
  hasApiConnectors: true,
  setup: () => {
    registrarPlanoDiagnostico(metaBmDiagnosticPlan);
    for (const p of META_BM_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "mktg-meta-bm",
      label: "Meta Business",
      icon: Globe,
      to: "/marketing/meta-bm",
      permissionCheck: (perms) => perms?.mktg_meta_conectar === true,
      order: 20,
      moduloKey: "marketing",
    });

    registerNavItem({
      id: "mktg-meta-bm-campanhas",
      label: "Campanhas",
      icon: Globe,
      to: "/marketing/meta-bm/campanhas",
      permissionCheck: (perms) => perms?.mktg_meta_ver_campanhas === true,
      order: 21,
      moduloKey: "marketing",
    });

    registerNavItem({
      id: "mktg-meta-bm-posts",
      label: "Posts",
      icon: Globe,
      to: "/marketing/meta-bm/posts",
      permissionCheck: (perms) => perms?.mktg_meta_criar_posts === true,
      order: 22,
      moduloKey: "marketing",
    });

    registerPermissionDefaults("marketing", {
      cadastro: {
        mktg_meta_conectar: true,
        mktg_meta_ver_campanhas: true,
        mktg_meta_criar_posts: true,
        mktg_meta_ver_insights: true,
      },
      tecnologia: {
        mktg_meta_conectar: true,
        mktg_meta_ver_campanhas: true,
        mktg_meta_criar_posts: true,
        mktg_meta_ver_insights: true,
      },
    });
  },
};
