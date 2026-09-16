import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const NpsPesquisasPage = lazy(() =>
  import("~/features/nps/components/dashboard/NpsPesquisasPage").then(
    (m) => ({ default: m.NpsPesquisasPage }),
  ),
);

export const npsPesquisasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/nps/pesquisas",
  component: () => (
    <RequirePermission modulo="nps" permissions={["nps_gerenciar_perguntas"]}>
      <Suspense fallback={null}>
        <NpsPesquisasPage />
      </Suspense>
    </RequirePermission>
  ),
});
