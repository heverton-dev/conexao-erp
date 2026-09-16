import {
  LayoutDashboard,
  Users,
  UserCircle,
  BarChart3,
  Eye,
} from "lucide-react";
import {
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { ALL_PERMISSIONS } from "./permissions";
import { registrarPlanoDiagnostico } from "~/core/diagnostic";
import { cadastrosDiagnosticPlan } from "./diagnostic";

export const cadastrosModule: ModuleDefinition = {
  key: "cadastros",
  nome: "Cadastros",
  descricao: "Gestao de cadastro de clientes PF/PJ",
  icon: Users,
  routes: [
    "/cadastros/dashboard",
    "/cadastros/solicitacoes",
    "/cadastros/clientes",
    "/cadastros/consultor",
    "/cadastros/relatorios",
    "/cadastros/previsualizacao",
    "/global/acoes",
    "/empresa/tema",
  ],
  permissions: ALL_PERMISSIONS.map((p) => p.key),
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
    {
      key: "laboratorio",
      label: "Laboratório",
      descricao: "Testes e experimentos",
    },
    { key: "acoes", label: "Ações", descricao: "Ações customizadas" },
    {
      key: "formularios",
      label: "Formulários",
      descricao: "Campos e formulários dinâmicos",
    },
    { key: "apis", label: "APIs", descricao: "Conectores de API" },
  ],
  events: [
    {
      key: "cadastro.criado",
      label: "Cadastro Criado",
      descricao: "Dispara quando um novo cadastro é criado",
      type: "status_change",
    },
    {
      key: "cadastro.aprovado",
      label: "Cadastro Aprovado",
      descricao: "Dispara quando um cadastro é aprovado",
      type: "status_change",
    },
    {
      key: "cadastro.reprovado",
      label: "Cadastro Reprovado",
      descricao: "Dispara quando um cadastro é reprovado",
      type: "status_change",
    },
    {
      key: "documento.aprovado",
      label: "Documento Aprovado",
      descricao: "Dispara quando um documento é aprovado",
      type: "button_action",
    },
    {
      key: "documento.reprovado",
      label: "Documento Reprovado",
      descricao: "Dispara quando um documento é reprovado",
      type: "button_action",
    },
    {
      key: "link.gerado",
      label: "Link Gerado",
      descricao: "Dispara quando um link de cadastro é gerado",
      type: "button_action",
    },
    {
      key: "link_gerado",
      label: "Link Gerado (Pipeline)",
      descricao: "Dispara quando o status do pipeline muda para Link Gerado",
      type: "status_change",
    },
    {
      key: "dados_enviados",
      label: "Dados Enviados",
      descricao: "Dispara quando os dados do pré-cadastro são enviados",
      type: "status_change",
    },
    {
      key: "em_analise",
      label: "Em Análise",
      descricao: "Dispara quando o cadastro entra em análise",
      type: "status_change",
    },
    {
      key: "em_correcao",
      label: "Em Correção",
      descricao: "Dispara quando uma correção é solicitada",
      type: "status_change",
    },
    {
      key: "aprovado",
      label: "Aprovado (Pipeline)",
      descricao: "Dispara quando o cadastro é aprovado no pipeline",
      type: "status_change",
    },
    {
      key: "reprovado",
      label: "Reprovado (Pipeline)",
      descricao: "Dispara quando o cadastro é reprovado no pipeline",
      type: "status_change",
    },
    {
      key: "botao_compartilhar_link",
      label: "Compartilhar Link",
      descricao: "Dispara quando o botão de compartilhar link é clicado",
      type: "button_action",
    },
    {
      key: "botao_aprovar",
      label: "Aprovar Cadastro",
      descricao: "Dispara quando o botão de aprovar é clicado",
      type: "button_action",
    },
    {
      key: "botao_reprovar",
      label: "Reprovar Cadastro",
      descricao: "Dispara quando o botão de reprovar é clicado",
      type: "button_action",
    },
    {
      key: "botao_corrigir",
      label: "Solicitar Correção",
      descricao: "Dispara quando o botão de corrigir é clicado",
      type: "button_action",
    },
    {
      key: "criacao_credencial",
      label: "Criação de Credencial",
      descricao: "Dispara quando uma credencial é criada",
      type: "button_action",
    },
    {
      key: "clientes.importados",
      label: "Clientes Importados",
      descricao: "Dispara quando uma importação de clientes via CSV é concluída",
      type: "status_change",
    },
  ],
  hasCredentialScopes: false,
  hasLaboratorio: false,
  hasFormulario: true,
  hasCustomActions: false,
  hasApiConnectors: false,
  hasDiagnostico: true,
  hasDesignConfig: true,
  designRoute: "/empresa/cadastros/design",
  setup: () => {
    registrarPlanoDiagnostico(cadastrosDiagnosticPlan);
    for (const p of ALL_PERMISSIONS) {
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    }

    registerNavItem({
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/cadastros/dashboard",
      permissionCheck: (perms) => perms?.ver_todos_cadastros === true,
      order: 1,
      moduloKey: "cadastros",
    });

    registerNavItem({
      id: "solicitacoes",
      label: "Solicitações",
      icon: Users,
      to: "/cadastros/solicitacoes",
      matchPaths: ["/cadastros/solicitacoes/$id"],
      permissionCheck: (perms) =>
        perms?.ver_todos_cadastros === true || perms?.gerar_links === true,
      order: 2,
      moduloKey: "cadastros",
    });

    registerNavItem({
      id: "clientes",
      label: "Clientes",
      icon: Users,
      to: "/cadastros/clientes",
      permissionCheck: (perms) =>
        perms?.ver_todos_cadastros === true || perms?.gerar_links === true,
      order: 3,
      moduloKey: "cadastros",
    });

    registerNavItem({
      id: "consultor",
      label: "Consultor",
      icon: UserCircle,
      to: "/cadastros/consultor",
      permissionCheck: (perms) => perms?.gerar_links === true,
      order: 4,
      moduloKey: "cadastros",
      matchPaths: ["/cadastros/consultor/clientes"],
    });

    registerNavItem({
      id: "relatorios",
      label: "Relatórios",
      icon: BarChart3,
      to: "/cadastros/relatorios",
      permissionCheck: (perms) => perms?.ver_relatorios === true,
      order: 5,
      moduloKey: "cadastros",
    });

    registerNavItem({
      id: "previsualizacao",
      label: "Pré-visualização",
      icon: Eye,
      to: "/cadastros/previsualizacao",
      permissionCheck: (perms) => perms?.ver_todos_cadastros === true,
      order: 6,
      moduloKey: "cadastros",
    });

    registerPermissionDefaults("cadastros", {
      cadastro: {
        ver_todos_cadastros: true,
        aprovar_cadastro: true,
        reprovar_cadastro: true,
        solicitar_correcao_cadastro: true,
        aprovar_documento: true,
        reprovar_documento: true,
        solicitar_correcao_documento: true,
        aprovar_campo: true,
        reprovar_campo: true,
        solicitar_correcao_campo: true,
        visualizar_documento: true,
        excluir_cadastro: false,
        gerenciar_credenciais: false,
        gerenciar_credenciais_admin: false,
        gerenciar_config: false,
        gerar_links: false,
        ver_relatorios: true,
      },
      consultor: {
        ver_todos_cadastros: false,
        aprovar_cadastro: false,
        reprovar_cadastro: false,
        solicitar_correcao_cadastro: false,
        aprovar_documento: false,
        reprovar_documento: false,
        solicitar_correcao_documento: false,
 
        aprovar_campo: false,
        reprovar_campo: false,
        solicitar_correcao_campo: false,
        visualizar_documento: false,
        excluir_cadastro: false,
        gerenciar_credenciais: false,
        gerenciar_credenciais_admin: false,
        gerenciar_config: false,
        gerar_links: true,
        ver_relatorios: true,
      },
      tecnologia: {
        ver_todos_cadastros: false,
        aprovar_cadastro: false,
        reprovar_cadastro: false,
        solicitar_correcao_cadastro: false,
        aprovar_documento: false,
        reprovar_documento: false,
        solicitar_correcao_documento: false,
        aprovar_campo: false,
        reprovar_campo: false,
        solicitar_correcao_campo: false,
        visualizar_documento: false,
        excluir_cadastro: false,
        gerenciar_credenciais: true,
        gerenciar_credenciais_admin: true,
        gerenciar_config: false,
        gerar_links: false,
        ver_relatorios: false,
      },
      suporte: {
        ver_todos_cadastros: false,
        aprovar_cadastro: false,
        reprovar_cadastro: false,
        solicitar_correcao_cadastro: false,
        aprovar_documento: false,
        reprovar_documento: false,
        solicitar_correcao_documento: false,
        aprovar_campo: false,
        reprovar_campo: false,
        solicitar_correcao_campo: false,
        visualizar_documento: false,
        excluir_cadastro: false,
        gerenciar_credenciais: true,
        gerenciar_credenciais_admin: false,
        gerenciar_config: false,
        gerar_links: false,
        ver_relatorios: false,
      },
    });
  },
};