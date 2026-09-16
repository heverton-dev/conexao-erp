import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
const ModuloDesignPage = lazy(() =>
  import("~/design-system/components/ModuloDesignPage").then((m) => ({ default: m.ModuloDesignPage })),
);
import { RequirePermission } from "~/components/guards";

export const empresaRotasDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/rotas/design",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <Suspense fallback={null}>
        <ModuloDesignPage moduloKey="rotas" moduloNome="Rotas de Visitas" />
      </Suspense>
    </RequirePermission>
  ),
});
