import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const LeadsList = lazy(() =>
  import("~/features/marketing/leads/components/LeadsList").then((m) => ({
    default: m.LeadsList,
  })),
);

export const marketingLeadsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/leads",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_lead_ver"]}>
      <Suspense fallback={null}>
        <LeadsList />
      </Suspense>
    </RequirePermission>
  ),
});
