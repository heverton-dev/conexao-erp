import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { WhatsappGenerator } from "~/features/gerador-links/components/sections/WhatsappGenerator";
import { RequirePermission } from "~/components/guards";

function WhatsappPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="WhatsApp"
        description="Gere links wa.me para WhatsApp com mensagem personalizada"
      />
      <WhatsappGenerator />
    </div>
  );
}

export const ferramentasLinksWhatsappRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/whatsapp",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_gerar"]}>
      <WhatsappPage />
    </RequirePermission>
  ),
});
