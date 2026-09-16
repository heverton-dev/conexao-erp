import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const PublicMapShell = lazy(() =>
  import("~/features/mapas/components/PublicMapShell").then((m) => ({
    default: m.PublicMapShell,
  })),
);

export const mapasConsultoresRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/mapas/consultores",
  component: () => (
    <RequirePermission modulo="mapas-interativos" permissions={["mapas_ver_mapa_publico"]}>
      <Suspense fallback={null}>
        <PublicMapShell variant="consultores" />
      </Suspense>
    </RequirePermission>
  ),
});
