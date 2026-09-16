import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const MetaConnect = lazy(() =>
  import("~/features/marketing/meta-bm/components/MetaConnect").then((m) => ({
    default: m.MetaConnect,
  })),
);

export const marketingMetaBmRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/meta-bm",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_meta_ver_campanhas"]}>
      <Suspense fallback={null}>
        <MetaConnect />
      </Suspense>
    </RequirePermission>
  ),
});
