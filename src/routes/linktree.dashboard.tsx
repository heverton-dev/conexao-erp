import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const LinktreeDashboardPage = lazy(() =>
  import("~/features/linktree/components/LinktreeDashboardPage").then((m) => ({ default: m.LinktreeDashboardPage })),
);

export const linktreeDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/linktree/dashboard",
  component: () => (
    <RequirePermission modulo="linktree" permissions={["lt_ver_dashboard"]}>
      <Suspense fallback={null}>
        <LinktreeDashboardPage />
      </Suspense>
    </RequirePermission>
  ),
});
