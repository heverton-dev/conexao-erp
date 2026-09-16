import {
  GitBranch,
  LayoutDashboard,
  Palette,
  FileText,
  Zap,
} from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { FUNIS_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { funisDiagnosticPlan } from "./diagnostic";

export const funisModule: ModuleDefinition = {
  key: "funis",
  nome: "Funis",
  descricao: "Gerenciamento de funis Kanban para fluxos de trabalho",
  icon: GitBranch,
  routes: [
    "/funis/dashboard",
    "/funis/funil/$funilId",
    "/funis/templates",
    "/funis/funil/$funilId/automations",
  ],
  permissions: FUNIS_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor", "tecnologia"],
  abas: [
    {
      key: "geral",
      label: "Geral",
      descricao: "Configurações gerais do Funis",
    },
    {
      key: "permissoes",
      label: "Permissões",
      descricao: "Gerenciar permissões do módulo",
    },
    {
      key: "credenciais",
      label: "Credenciais",
      descricao: "Credenciais com escopo no Funis",
    },
    {
      key: "eventos",
      label: "Eventos",
      descricao: "Eventos e webhooks do Funis",
    },
  ],
  events: [
    {
      key: "funil.criado",
      label: "Funil Criado",
      descricao: "Quando um novo funil é criado",
      type: "status_change",
    },
    {
      key: "funil.atualizado",
      label: "Funil Atualizado",
      descricao: "Quando um funil é editado",
      type: "status_change",
    },
    {
      key: "funil.excluido",
      label: "Funil Excluído",
      descricao: "Quando um funil é removido",
      type: "status_change",
    },
    {
      key: "tarefa.criada",
      label: "Tarefa Criada",
      descricao: "Quando uma nova tarefa é adicionada",
      type: "status_change",
    },
    {
      key: "tarefa.concluida",
      label: "Tarefa Concluída",
      descricao: "Quando uma tarefa é marcada como concluída",
      type: "button_action",
    },
    {
      key: "tarefa.movida",
      label: "Tarefa Movida",
      descricao: "Quando uma tarefa é movida entre colunas",
      type: "button_action",
    },
    {
      key: "tarefa.comentario_adicionado",
      label: "Comentário Adicionado",
      descricao: "Quando um comentário é adicionado a uma tarefa",
      type: "status_change",
    },
    {
      key: "tarefa.anexo_adicionado",
      label: "Anexo Adicionado",
      descricao: "Quando um anexo é adicionado a uma tarefa",
      type: "status_change",
    },
    {
      key: "tarefa.label_adicionado",
      label: "Label Adicionado",
      descricao: "Quando um label é adicionado a uma tarefa",
      type: "status_change",
    },
    {
      key: "tarefa.atrasada",
      label: "Tarefa Atrasada",
      descricao: "Quando uma tarefa ultrapassa a data fim",
      type: "status_change",
    },
    {
      key: "funil.criado_template",
      label: "Funil Criado via Template",
      descricao: "Quando um funil é criado a partir de template",
      type: "status_change",
    },
    {
      key: "automacao.executada",
      label: "Automação Executada",
      descricao: "Quando uma regra de automação é executada",
      type: "button_action",
    },
  ],
  hasDiagnostico: true,
  hasCredentialScopes: true,
  hasDesignConfig: true,
  designRoute: "/empresa/funis/design",
  setup: () => {
    registrarPlanoDiagnostico(funisDiagnosticPlan);
    for (const p of FUNIS_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "funis-dashboard",
      label: "Dashboard Funis",
      icon: LayoutDashboard,
      to: "/funis/dashboard",
      permissionCheck: (perms) => perms?.funis_ver_dashboard === true,
      order: 20,
      moduloKey: "funis",
    });

    registerNavItem({
      id: "funis-templates",
      label: "Templates",
      icon: FileText,
      to: "/funis/templates",
      permissionCheck: (perms) => perms?.funis_criar_template === true,
      order: 25,
      moduloKey: "funis",
    });

    registerPermissionDefaults("funis", {
      cadastro: {
        funis_ver_dashboard: true,
        funis_criar_funil: true,
        funis_editar_funil: true,
        funis_excluir_funil: false,
        funis_gerir_colunas: true,
        funis_gerir_tarefas: true,
        funis_compartilhar: true,
        funis_ver_relatorios: true,
        funis_ver_comentarios: true,
        funis_adicionar_comentario: true,
        funis_ver_anexos: true,
        funis_adicionar_anexo: true,
        funis_gerir_labels: true,
        funis_ver_atividade: true,
        funis_criar_template: true,
        funis_gerir_automacoes: true,
        funis_exportar_dados: true,
        funis_acoes_massa: true,
      },
      consultor: {
        funis_ver_dashboard: true,
        funis_criar_funil: false,
        funis_editar_funil: false,
        funis_excluir_funil: false,
        funis_gerir_colunas: false,
        funis_gerir_tarefas: true,
        funis_compartilhar: false,
        funis_ver_relatorios: false,
        funis_ver_comentarios: true,
        funis_adicionar_comentario: true,
        funis_ver_anexos: true,
        funis_adicionar_anexo: false,
        funis_gerir_labels: false,
        funis_ver_atividade: true,
        funis_criar_template: false,
        funis_gerir_automacoes: false,
        funis_exportar_dados: false,
        funis_acoes_massa: false,
      },
      tecnologia: {
        funis_ver_dashboard: true,
        funis_criar_funil: true,
        funis_editar_funil: true,
        funis_excluir_funil: true,
        funis_gerir_colunas: true,
        funis_gerir_tarefas: true,
        funis_compartilhar: true,
        funis_ver_relatorios: true,
        funis_ver_comentarios: true,
        funis_adicionar_comentario: true,
        funis_ver_anexos: true,
        funis_adicionar_anexo: true,
        funis_gerir_labels: true,
        funis_ver_atividade: true,
        funis_criar_template: true,
        funis_gerir_automacoes: true,
        funis_exportar_dados: true,
        funis_acoes_massa: true,
      },
      suporte: {
        funis_ver_dashboard: false,
        funis_criar_funil: false,
        funis_editar_funil: false,
        funis_excluir_funil: false,
        funis_gerir_colunas: false,
        funis_gerir_tarefas: false,
        funis_compartilhar: false,
        funis_ver_relatorios: false,
        funis_ver_comentarios: false,
        funis_adicionar_comentario: false,
        funis_ver_anexos: false,
        funis_adicionar_anexo: false,
        funis_gerir_labels: false,
        funis_ver_atividade: false,
        funis_criar_template: false,
        funis_gerir_automacoes: false,
        funis_exportar_dados: false,
        funis_acoes_massa: false,
      },
    });
  },
};
