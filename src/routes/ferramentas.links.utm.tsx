import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { UtmGenerator } from "~/features/gerador-links/components/sections/UtmGenerator";
import { RequirePermission } from "~/components/guards";

function UtmPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="UTM"
        description="Gere URLs com parâmetros UTM para campanhas de marketing"
      />
      <UtmGenerator />
    </div>
  );
}

export const ferramentasLinksUtmRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/utm",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_gerar"]}>
      <UtmPage />
    </RequirePermission>
  ),
});
