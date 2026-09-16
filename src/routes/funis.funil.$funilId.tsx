import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const FunilDetallePage = lazy(() =>
  import("~/features/funis/components/FunilDetallePage").then((m) => ({
    default: m.FunilDetallePage,
  })),
);

export const funilDetalleRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/funis/funil/$funilId",
  component: () => (
    <RequirePermission modulo="funis" permissions={["funis_ver_dashboard"]}>
      <Suspense fallback={null}>
        <FunilDetallePage />
      </Suspense>
    </RequirePermission>
  ),
});
