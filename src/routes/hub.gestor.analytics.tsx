import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const AdminAnalyticsPage = lazy(() =>
  import("~/features/hub/pages/admin/AdminAnalyticsPage").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);

export const hubGestorAnalyticsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/gestor/analytics",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_ver_analytics"]}>
      <Suspense fallback={null}>
        <AdminAnalyticsPage />
      </Suspense>
    </RequirePermission>
  ),
});
