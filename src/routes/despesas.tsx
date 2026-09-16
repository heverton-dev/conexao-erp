import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const MinhasDespesasPage = lazy(() =>
  import("~/features/despesas/components/colaborador/MinhasDespesasPage").then((m) => ({ default: m.MinhasDespesasPage })),
);

export const despesasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/despesas",
  component: () => (
    <RequirePermission modulo="despesas" permissions={["despesas_lancar"]}>
      <Suspense fallback={null}>
        <MinhasDespesasPage />
      </Suspense>
    </RequirePermission>
  ),
});
