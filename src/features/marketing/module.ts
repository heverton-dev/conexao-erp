import { Megaphone } from "lucide-react";
import { registerModule, registerNavItem } from "~/registry";
import type { ModuleDefinition } from "~/registry";

export const marketingModule: ModuleDefinition = {
  key: "marketing",
  nome: "Marketing",
  descricao: "Modulo de Marketing Digital - Visao geral",
  icon: Megaphone,
  routes: ["/marketing/dashboard"],
  permissions: [],
  ambientes: ["cadastro", "tecnologia"],
  abas: [],
  events: [],
  setup: () => {
    registerNavItem({
      id: "marketing",
      label: "Marketing",
      icon: Megaphone,
      to: "/marketing/dashboard",
      permissionCheck: () => true,
      order: 30,
      moduloKey: "marketing",
    });
  },
};
