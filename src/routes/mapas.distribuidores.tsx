import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const PublicMapShell = lazy(() =>
  import("~/features/mapas/components/PublicMapShell").then((m) => ({ default: m.PublicMapShell })),
);

export const mapasDistribuidoresRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/mapas/distribuidores",
  component: () => (
    <RequirePermission modulo="mapas-interativos" permissions={["mapas_ver_mapa_publico"]}>
      <Suspense fallback={null}>
        <PublicMapShell variant="distribuidores" />
      </Suspense>
    </RequirePermission>
  ),
});
