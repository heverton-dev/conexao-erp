import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const HubRankingPage = lazy(() =>
  import("~/features/hub/pages/HubRankingPage").then((m) => ({
    default: m.HubRankingPage,
  })),
);

export const hubGestorRankingRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/gestor/ranking",
  component: () => (
    <RequirePermission modulo="hub" permissions={["hub_ver_analytics"]}>
      <Suspense fallback={null}>
        <HubRankingPage />
      </Suspense>
    </RequirePermission>
  ),
});
