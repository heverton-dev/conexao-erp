import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const HistoricoList = lazy(() =>
  import("~/features/gerador-links/components/HistoricoList").then((m) => ({
    default: m.HistoricoList,
  })),
);

export const ferramentasLinksHistoricoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/historico",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_ver"]}>
      <Suspense fallback={null}>
        <HistoricoList />
      </Suspense>
    </RequirePermission>
  ),
});
