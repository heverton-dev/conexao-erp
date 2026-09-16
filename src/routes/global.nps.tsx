import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequireSuperAdmin } from "~/components/guards";

const GlobalNpsDashboardPage = lazy(() =>
  import("~/features/nps/components/dashboard/GlobalNpsDashboardPage").then((m) => ({ default: m.GlobalNpsDashboardPage })),
);

export const globalNpsDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/nps",
  component: () => (
    <RequireSuperAdmin>
      <Suspense fallback={null}>
        <GlobalNpsDashboardPage />
      </Suspense>
    </RequireSuperAdmin>
  ),
});
