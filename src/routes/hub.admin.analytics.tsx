import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const AdminAnalyticsPage = lazy(() =>
  import("~/features/hub/pages/admin/AdminAnalyticsPage").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);

export const hubAdminAnalyticsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/admin/analytics",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_gerenciar_config"]}>
      <Suspense fallback={null}>
        <AdminAnalyticsPage />
      </Suspense>
    </RequirePermission>
  ),
});
