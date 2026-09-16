import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
const ModuloDesignPage = lazy(() =>
  import("~/design-system/components/ModuloDesignPage").then((m) => ({ default: m.ModuloDesignPage })),
);
import { RequirePermission } from "~/components/guards";

export const empresaHubDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/hub/design",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <Suspense fallback={null}>
        <ModuloDesignPage moduloKey="hub" moduloNome="Hub de Engajamento" />
      </Suspense>
    </RequirePermission>
  ),
});
