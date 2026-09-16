import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const MetaCampanhasList = lazy(() =>
  import("~/features/marketing/meta-bm/components/MetaCampanhasList").then((m) => ({
    default: m.MetaCampanhasList,
  })),
);

export const marketingMetaBmCampanhasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/meta-bm/campanhas",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_meta_ver_campanhas"]}>
      <Suspense fallback={null}>
        <MetaCampanhasList />
      </Suspense>
    </RequirePermission>
  ),
});
