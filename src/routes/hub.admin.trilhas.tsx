import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const AdminTrilhasPage = lazy(() =>
  import("~/features/hub/pages/admin/AdminTrilhasPage").then((m) => ({
    default: m.AdminTrilhasPage,
  })),
);

export const hubAdminTrilhasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/admin/trilhas",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_gerenciar_config"]}>
      <Suspense fallback={null}>
        <AdminTrilhasPage />
      </Suspense>
    </RequirePermission>
  ),
});
