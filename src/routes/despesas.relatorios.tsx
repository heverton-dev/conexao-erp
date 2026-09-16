import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const RelatoriosDespesasPage = lazy(() =>
  import("~/features/despesas/components/admin/RelatoriosDespesasPage").then((m) => ({ default: m.RelatoriosDespesasPage })),
);

export const despesasRelatoriosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/despesas/relatorios",
  component: () => (
    <RequirePermission modulo="despesas" permissions={["despesas_ver_relatorios"]}>
      <Suspense fallback={null}>
        <RelatoriosDespesasPage />
      </Suspense>
    </RequirePermission>
  ),
});
