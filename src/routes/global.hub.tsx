import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequireSuperAdmin } from "~/components/guards";

const HubDashboardPage = lazy(() =>
  import("~/features/hub/pages/HubDashboardPage").then((m) => ({
    default: m.HubDashboardPage,
  })),
);

export const globalHubRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/hub",
  component: () => (
    <RequireSuperAdmin>
      <Suspense fallback={null}>
        <HubDashboardPage />
      </Suspense>
    </RequireSuperAdmin>
  ),
});
