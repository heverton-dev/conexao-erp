import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { Navigate } from "@tanstack/react-router";
import { RequirePermission } from "~/components/guards";

export const mapasAdminRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/mapas/gestao",
  component: () => (
    <RequirePermission modulo="mapas-interativos" permissions={["mapas_gerir_distribuidores", "mapas_gerir_consultores"]}>
      <Navigate to="/mapas/insights" />
    </RequirePermission>
  ),
});
