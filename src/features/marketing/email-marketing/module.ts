import { Mail } from "lucide-react";
import {
  registerModule,
  registerNavItem,
  registerPermission,
  registerPermissionDefaults,
} from "~/registry";
import type { ModuleDefinition } from "~/registry";
import { EMAIL_MARKETING_PERMISSIONS } from "./permissions";

export const emailMarketingModule: ModuleDefinition = {
  key: "mktg-email",
  nome: "E-mail Marketing",
  descricao: "Campanhas e disparos de e-mail",
  icon: Mail,
  routes: ["/marketing/email"],
  permissions: EMAIL_MARKETING_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks do módulo" },
  ],
  events: [
    {
      key: "campanha.criada",
      label: "Campanha Criada",
      descricao: "Quando uma campanha de e-mail é criada",
      type: "status_change",
    },
    {
      key: "email.enviado",
      label: "E-mail Enviado",
      descricao: "Quando um e-mail é disparado",
      type: "button_action",
    },
    {
      key: "email.aberto",
      label: "E-mail Aberto",
      descricao: "Quando um e-mail é aberto pelo destinatário",
      type: "status_change",
    },
    {
      key: "email.clicado",
      label: "Link Clicado no E-mail",
      descricao: "Quando um link no e-mail é clicado",
      type: "status_change",
    },
  ],
  hasCredentialScopes: true,
  setup: () => {
    for (const p of EMAIL_MARKETING_PERMISSIONS)
      registerPermission({
        key: p.key,
        label: p.label,
        description: p.description,
        group: p.group,
      });
    registerNavItem({
      id: "mktg-email",
      label: "E-mail Marketing",
      icon: Mail,
      to: "/marketing/email",
      permissionCheck: (perms) => perms?.mktg_email_ver === true,
      order: 70,
      moduloKey: "marketing",
    });
    registerPermissionDefaults("mktg-email", {
      cadastro: { mktg_email_ver: true, mktg_email_criar: true, mktg_email_editar: true, mktg_email_excluir: true, mktg_email_enviar: true },
      tecnologia: { mktg_email_ver: true, mktg_email_criar: true, mktg_email_editar: true, mktg_email_excluir: true, mktg_email_enviar: true },
      consultor: { mktg_email_ver: false, mktg_email_criar: false, mktg_email_editar: false, mktg_email_excluir: false, mktg_email_enviar: false },
      suporte: { mktg_email_ver: false, mktg_email_criar: false, mktg_email_editar: false, mktg_email_excluir: false, mktg_email_enviar: false },
    });
  },
};
