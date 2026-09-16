import { Bot, Sparkles, Settings, BarChart3, Cpu, Server } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { AGENTES_PERMISSIONS } from "./permissions";

export const agentesModule: ModuleDefinition = {
  key: "agentes-ia",
  nome: "Agentes IA",
  descricao: "Crie e gerencie agentes inteligentes para seus modulos",
  icon: Bot,
  routes: ["/empresa/agentes", "/global/agentes"],
  permissions: AGENTES_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    {
      key: "geral",
      label: "Geral",
      descricao: "Configuracoes gerais dos agentes",
    },
    {
      key: "provedores",
      label: "Provedores",
      descricao: "Gerenciar provedores e modelos de IA",
    },
    {
      key: "permissoes",
      label: "Permissoes",
      descricao: "Gerenciar permissoes do modulo",
    },
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos e webhooks dos agentes",
    },
  ],
  events: [
    {
      key: "agente.criado",
      label: "Agente Criado",
      descricao: "Dispara quando um agente e criado",
      type: "status_change",
    },
    {
      key: "agente.editado",
      label: "Agente Editado",
      descricao: "Dispara quando um agente e editado",
      type: "status_change",
    },
    {
      key: "agente.testado",
      label: "Agente Testado",
      descricao: "Dispara quando o playground e usado",
      type: "button_action",
    },
    {
      key: "agente.ativado",
      label: "Agente Ativado",
      descricao: "Dispara quando um agente e ativado",
      type: "status_change",
    },
    {
      key: "provedor.criado",
      label: "Provedor Criado",
      descricao: "Dispara quando um provedor e criado",
      type: "status_change",
    },
    {
      key: "provedor.editado",
      label: "Provedor Editado",
      descricao: "Dispara quando um provedor e editado",
      type: "status_change",
    },
    {
      key: "provedor.excluido",
      label: "Provedor Excluido",
      descricao: "Dispara quando um provedor e excluido",
      type: "status_change",
    },
  ],
  hasDiagnostico: false,
  setup: () => {
    for (const p of AGENTES_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerPermissionDefaults("agentes-ia", {
      cadastro: {
        agentes_ver: true,
        agentes_criar: true,
        agentes_editar: true,
        agentes_excluir: true,
        agentes_testar: true,
        agentes_provedores_gerenciar: true,
      },
      consultor: {
        agentes_ver: false,
        agentes_criar: false,
        agentes_editar: false,
        agentes_excluir: false,
        agentes_testar: false,
        agentes_provedores_gerenciar: false,
      },
      tecnologia: {
        agentes_ver: true,
        agentes_criar: true,
        agentes_editar: true,
        agentes_excluir: true,
        agentes_testar: true,
        agentes_provedores_gerenciar: true,
      },
      suporte: {
        agentes_ver: false,
        agentes_criar: false,
        agentes_editar: false,
        agentes_excluir: false,
        agentes_testar: false,
        agentes_provedores_gerenciar: false,
      },
    });
  },
};
