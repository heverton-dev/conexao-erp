import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const LandingPagesList = lazy(() =>
  import("~/features/marketing/landing-pages/components/LandingPagesList").then((m) => ({
    default: m.LandingPagesList,
  })),
);

export const marketingLandingPagesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/landing-pages",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_lp_ver"]}>
      <Suspense fallback={null}>
        <LandingPagesList />
      </Suspense>
    </RequirePermission>
  ),
});
