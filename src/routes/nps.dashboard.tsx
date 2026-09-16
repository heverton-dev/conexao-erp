import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const NpsDashboardPage = lazy(() =>
  import("~/features/nps/components/dashboard/NpsDashboardPage").then(
    (m) => ({ default: m.NpsDashboardPage }),
  ),
);

export const npsDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/nps/dashboard",
  component: () => (
    <RequirePermission modulo="nps" permissions={["nps_ver_dashboard"]}>
      <Suspense fallback={null}>
        <NpsDashboardPage />
      </Suspense>
    </RequirePermission>
  ),
});
