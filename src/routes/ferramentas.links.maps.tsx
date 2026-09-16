import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { GoogleMapsGenerator } from "~/features/gerador-links/components/sections/GoogleMapsGenerator";
import { RequirePermission } from "~/components/guards";

function GoogleMapsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Google Maps"
        description="Gere link de navegação para o Google Maps com coordenadas"
      />
      <GoogleMapsGenerator />
    </div>
  );
}

export const ferramentasLinksMapsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/maps",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_gerar"]}>
      <GoogleMapsPage />
    </RequirePermission>
  ),
});
