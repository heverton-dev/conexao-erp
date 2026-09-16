import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const HubDashboardPage = lazy(() =>
  import("~/features/hub/pages/HubDashboardPage").then((m) => ({
    default: m.HubDashboardPage,
  })),
);

export const hubDistribuidorDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/distribuidor/dashboard",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_ver_materiais"]}>
      <Suspense fallback={null}>
        <HubDashboardPage
          roleFilter="distributor"
          conquistasPath="/hub/distribuidor/conquistas"
        />
      </Suspense>
    </RequirePermission>
  ),
});
