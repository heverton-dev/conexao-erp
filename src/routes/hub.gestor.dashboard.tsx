import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const HubDashboardPage = lazy(() =>
  import("~/features/hub/pages/HubDashboardPage").then((m) => ({
    default: m.HubDashboardPage,
  })),
);

export const hubGestorDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/gestor/dashboard",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_ver_analytics"]}>
      <Suspense fallback={null}>
        <HubDashboardPage
          roleFilter="manager"
          conquistasPath="/hub/gestor/conquistas"
        />
      </Suspense>
    </RequirePermission>
  ),
});
