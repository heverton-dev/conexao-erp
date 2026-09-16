import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const CalendarioGrid = lazy(() =>
  import("~/features/marketing/calendario-editorial/components/CalendarioGrid").then((m) => ({
    default: m.CalendarioGrid,
  })),
);

export const marketingCalendarioRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/calendario",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_cal_ver"]}>
      <Suspense fallback={null}>
        <CalendarioGrid />
      </Suspense>
    </RequirePermission>
  ),
});
