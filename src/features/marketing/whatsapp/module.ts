import { MessageSquare } from "lucide-react";
import { registerNavItem } from "~/registry";
import type { ModuleDefinition } from "~/registry";

export const whatsappMarketingModule: ModuleDefinition = {
  key: "mktg-whatsapp",
  nome: "WhatsApp Marketing",
  descricao: "Disparos e campanhas de mensagens pelo WhatsApp",
  icon: MessageSquare,
  routes: ["/marketing/whatsapp"],
  permissions: ["mktg_wpp_ver", "mktg_wpp_enviar"],
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks do módulo" },
  ],
  events: [
    {
      key: "mensagem.enviada",
      label: "Mensagem Enviada",
      descricao: "Quando uma mensagem é enviada pelo WhatsApp",
      type: "button_action",
    },
    {
      key: "template.cadastrado",
      label: "Template Cadastrado",
      descricao: "Quando um template de mensagem é cadastrado",
      type: "status_change",
    },
  ],
  setup: () => {
    registerNavItem({
      id: "mktg-whatsapp",
      label: "WhatsApp Marketing",
      icon: MessageSquare,
      to: "/marketing/whatsapp",
      permissionCheck: (perms) => perms?.mktg_wpp_ver === true,
      order: 75,
      moduloKey: "marketing",
    });
  },
};
