import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequireEmpresaAdmin } from "~/components/guards";
const ManutencaoPanel = lazy(() =>
  import("~/features/manutencao/components/ManutencaoPanel").then((m) => ({ default: m.ManutencaoPanel })),
);

export const empresaManutencaoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/manutencao",
  component: () => (
    <RequireEmpresaAdmin>
      <Suspense fallback={null}>
        <ManutencaoPanel />
      </Suspense>
    </RequireEmpresaAdmin>
  ),
});
