import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const HubConquistasPage = lazy(() =>
  import("~/features/hub/pages/HubConquistasPage").then((m) => ({
    default: m.HubConquistasPage,
  })),
);

export const hubConsultorConquistasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/consultor/conquistas",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_ver_materiais"]}>
      <Suspense fallback={null}>
        <HubConquistasPage />
      </Suspense>
    </RequirePermission>
  ),
});
