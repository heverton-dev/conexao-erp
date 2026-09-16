import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const HubDashboardPage = lazy(() =>
  import("~/features/hub/pages/HubDashboardPage").then((m) => ({
    default: m.HubDashboardPage,
  })),
);

export const hubAdminDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/admin/dashboard",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_gerenciar_config"]}>
      <Suspense fallback={null}>
        <HubDashboardPage conquistasPath="/hub/admin/badges" />
      </Suspense>
    </RequirePermission>
  ),
});
