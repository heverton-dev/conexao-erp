import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const MarketingDashboard = lazy(() =>
  import("~/features/marketing/dashboard/components/MarketingDashboard").then((m) => ({
    default: m.MarketingDashboard,
  })),
);

export const marketingDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/dashboard",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_dashboard_ver"]}>
      <Suspense fallback={null}>
        <MarketingDashboard />
      </Suspense>
    </RequirePermission>
  ),
});
