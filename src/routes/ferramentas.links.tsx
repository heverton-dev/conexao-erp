import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const DashboardPage = lazy(() =>
  import("~/features/gerador-links/components/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);

export const ferramentasLinksRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_ver"]}>
      <Suspense fallback={null}>
        <DashboardPage />
      </Suspense>
    </RequirePermission>
  ),
});
