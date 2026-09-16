import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const AprovacaoDespesasPage = lazy(() =>
  import("~/features/despesas/components/responsavel/AprovacaoDespesasPage").then((m) => ({ default: m.AprovacaoDespesasPage })),
);

export const despesasAprovacaoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/despesas/aprovacao",
  component: () => (
    <RequirePermission modulo="despesas" permissions={["despesas_aprovar", "despesas_reprovar"]}>
      <Suspense fallback={null}>
        <AprovacaoDespesasPage />
      </Suspense>
    </RequirePermission>
  ),
});
