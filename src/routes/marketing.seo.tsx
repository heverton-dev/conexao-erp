import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const SeoAuditoria = lazy(() =>
  import("~/features/marketing/seo/components/SeoAuditoria").then((m) => ({
    default: m.SeoAuditoria,
  })),
);

export const marketingSeoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/seo",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_seo_ver"]}>
      <Suspense fallback={null}>
        <SeoAuditoria />
      </Suspense>
    </RequirePermission>
  ),
});
