import { Palette } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { CRIATIVOS_PERMISSIONS } from "./permissions";

export const criativosModule: ModuleDefinition = {
  key: "mktg-criativos",
  nome: "Criativos",
  descricao: "Gerenciamento de criativos de marketing",
  icon: Palette,
  routes: ["/marketing/criativos"],
  permissions: CRIATIVOS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks do módulo" },
  ],
  events: [
    {
      key: "criativo.criado",
      label: "Criativo Criado",
      descricao: "Dispara quando um novo criativo de marketing é adicionado",
      type: "status_change",
    },
  ],
  setup: () => {
    for (const p of CRIATIVOS_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-criativos",
      label: "Criativos",
      icon: Palette,
      to: "/marketing/criativos",
      permissionCheck: (perms) => perms?.mktg_criativo_ver === true,
      order: 60,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-criativos", {
      cadastro: { mktg_criativo_ver: true, mktg_criativo_criar: true, mktg_criativo_editar: true, mktg_criativo_excluir: true },
      tecnologia: { mktg_criativo_ver: true, mktg_criativo_criar: true, mktg_criativo_editar: true, mktg_criativo_excluir: true },
      consultor: { mktg_criativo_ver: false, mktg_criativo_criar: false, mktg_criativo_editar: false, mktg_criativo_excluir: false },
      suporte: { mktg_criativo_ver: false, mktg_criativo_criar: false, mktg_criativo_editar: false, mktg_criativo_excluir: false },
    });
  },
};
