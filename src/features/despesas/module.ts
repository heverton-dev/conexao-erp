import {
  Receipt,
  Settings,
  FileText,
  CreditCard,
  Palette,
  BarChart3,
} from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { DESPESAS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { despesasDiagnosticPlan } from "./diagnostic";

export const despesasModule: ModuleDefinition = {
  key: "despesas",
  nome: "Despesas em Rota",
  descricao: "Gestão de despesas em rota, aprovação e reembolso",
  icon: Receipt,
  routes: [
    "/despesas",
    "/despesas/aprovacao",
    "/despesas/meus-relatorios",
    "/despesas/relatorios",
  ],
  permissions: DESPESAS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor", "tecnologia", "suporte"],
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
      key: "credenciais",
      label: "Credenciais",
      descricao: "Credenciais com escopo no módulo",
    },
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos e webhooks do módulo",
    },
  ],
  events: [
    {
      key: "despesa.criada",
      label: "Despesa Criada",
      descricao: "Dispara quando uma nova despesa é lançada",
      type: "button_action",
    },
    {
      key: "despesa.enviada",
      label: "Despesa Enviada",
      descricao: "Dispara quando despesas são enviadas para aprovação",
      type: "button_action",
    },
    {
      key: "despesa.aprovada",
      label: "Despesa Aprovada",
      descricao: "Dispara quando despesas são aprovadas",
      type: "status_change",
    },
    {
      key: "despesa.reprovada",
      label: "Despesa Reprovada",
      descricao: "Dispara quando despesas são reprovadas",
      type: "status_change",
    },
    {
      key: "pagamento.agendado",
      label: "Pagamento Agendado",
      descricao: "Dispara quando pagamento é agendado",
      type: "status_change",
    },
    {
      key: "periodo.aberto",
      label: "Período Aberto",
      descricao: "Dispara quando um período é aberto",
      type: "status_change",
    },
    {
      key: "periodo.fechando",
      label: "Período Fechando",
      descricao: "Dispara quando período está prestes a fechar",
      type: "status_change",
    },
  ],
  hasDiagnostico: true,
  hasCredentialScopes: true,
  hasDesignConfig: true,
  designRoute: "/empresa/despesas/design",
  setup: () => {
    registrarPlanoDiagnostico(despesasDiagnosticPlan);
    for (const p of DESPESAS_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "despesas",
      label: "Despesas",
      icon: Receipt,
      to: "/despesas",
      noChildMatch: true,
      permissionCheck: (perms) => perms?.despesas_lancar === true,
      order: 20,
      moduloKey: "despesas",
    });

    registerNavItem({
      id: "despesas-aprovacao",
      label: "Aprovação",
      icon: FileText,
      to: "/despesas/aprovacao",
      permissionCheck: (perms) =>
        perms?.despesas_aprovar === true || perms?.despesas_reprovar === true,
      order: 23,
      moduloKey: "despesas",
    });

    registerNavItem({
      id: "despesas-meus-relatorios",
      label: "Meus Relatórios",
      icon: BarChart3,
      to: "/despesas/meus-relatorios",
      permissionCheck: (perms) =>
        perms?.despesas_lancar === true || perms?.despesas_enviar === true,
      order: 24,
      moduloKey: "despesas",
    });

    registerNavItem({
      id: "despesas-relatorios",
      label: "Relatórios",
      icon: BarChart3,
      to: "/despesas/relatorios",
      permissionCheck: (perms) => perms?.despesas_ver_relatorios === true,
      order: 25,
      moduloKey: "despesas",
    });

    registerPermissionDefaults("despesas", {
      cadastro: {
        despesas_lancar: true,
        despesas_enviar: true,
        despesas_aprovar: false,
        despesas_reprovar: false,
        despesas_definir_pagamento: false,
        despesas_configurar: false,
        despesas_ver_relatorios: true,
        despesas_ver_todas: false,
      },
      consultor: {
        despesas_lancar: true,
        despesas_enviar: true,
        despesas_aprovar: false,
        despesas_reprovar: false,
        despesas_definir_pagamento: false,
        despesas_configurar: false,
        despesas_ver_relatorios: false,
        despesas_ver_todas: false,
      },
      tecnologia: {
        despesas_lancar: true,
        despesas_enviar: true,
        despesas_aprovar: true,
        despesas_reprovar: true,
        despesas_definir_pagamento: true,
        despesas_configurar: true,
        despesas_ver_relatorios: true,
        despesas_ver_todas: true,
      },
      suporte: {
        despesas_lancar: false,
        despesas_enviar: false,
        despesas_aprovar: false,
        despesas_reprovar: false,
        despesas_definir_pagamento: false,
        despesas_configurar: false,
        despesas_ver_relatorios: true,
        despesas_ver_todas: false,
      },
    });
  },
};
