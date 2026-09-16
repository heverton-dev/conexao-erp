import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
const ConfigDespesasPage = lazy(() =>
  import("~/features/despesas/components/admin/ConfigDespesasPage").then((m) => ({
    default: m.ConfigDespesasPage,
  })),
);
import { RequirePermission } from "~/components/guards";

export const empresaDespesasConfigRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/despesas-config",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <Suspense fallback={null}>
        <ConfigDespesasPage />
      </Suspense>
    </RequirePermission>
  ),
});
