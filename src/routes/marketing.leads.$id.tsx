import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const LeadDetail = lazy(() =>
  import("~/features/marketing/leads/components/LeadDetail").then((m) => ({
    default: m.LeadDetail,
  })),
);

export const marketingLeadsDetailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/leads/$id",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_lead_ver"]}>
      <Suspense fallback={null}>
        <LeadDetail />
      </Suspense>
    </RequirePermission>
  ),
});
