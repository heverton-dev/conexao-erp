import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const AdminBadgesPage = lazy(() =>
  import("~/features/hub/pages/admin/AdminBadgesPage").then((m) => ({
    default: m.AdminBadgesPage,
  })),
);

export const hubAdminBadgesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/admin/badges",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_gerenciar_config"]}>
      <Suspense fallback={null}>
        <AdminBadgesPage />
      </Suspense>
    </RequirePermission>
  ),
});
