import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
const ConfigRotasPage = lazy(() =>
  import("~/features/rotas/components/ConfigRotasPage").then((m) => ({ default: m.ConfigRotasPage })),
);
import { RequirePermission } from "~/components/guards";

export const empresaRotasConfigRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/rotas/config",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <Suspense fallback={null}>
        <ConfigRotasPage />
      </Suspense>
    </RequirePermission>
  ),
});
