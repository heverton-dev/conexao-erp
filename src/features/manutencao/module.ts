import { Wrench } from "lucide-react";
import { registerModule } from "~/registry";
import type { ModuleDefinition } from "~/registry";

export const manutencaoModule: ModuleDefinition = {
  key: "manutencao",
  nome: "Manutenção",
  descricao: "Painel de manutenção de módulos e rotas",
  icon: Wrench,
  routes: ["/global/manutencao", "/empresa/manutencao"],
  ambientes: [],
  permissions: [],
  abas: [
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos de ativação e encerramento de manutenção",
    },
  ],
  events: [
    {
      key: "manutencao.ativada",
      label: "Manutenção ativada",
      descricao: "Modo manutenção ativado para módulo ou rota",
      type: "status_change",
    },
    {
      key: "manutencao.desativada",
      label: "Manutenção desativada",
      descricao: "Modo manutenção encerrado",
      type: "button_action",
    },
  ],
  setup: () => {
    // Nav item controlado em useNavItems.ts com verificação de role
  },
};
