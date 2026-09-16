import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { WazeGenerator } from "~/features/gerador-links/components/sections/WazeGenerator";
import { RequirePermission } from "~/components/guards";

function WazePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Waze"
        description="Gere link de navegação para o Waze com coordenadas"
      />
      <WazeGenerator />
    </div>
  );
}

export const ferramentasLinksWazeRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/waze",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_gerar"]}>
      <WazePage />
    </RequirePermission>
  ),
});
