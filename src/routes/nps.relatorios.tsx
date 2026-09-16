import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const NpsRelatoriosPage = lazy(() =>
  import("~/features/nps/components/dashboard/NpsRelatoriosPage").then(
    (m) => ({ default: m.NpsRelatoriosPage }),
  ),
);

export const npsRelatoriosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/nps/relatorios",
  component: () => (
    <RequirePermission modulo="nps" permissions={["nps_ver_relatorios"]}>
      <Suspense fallback={null}>
        <NpsRelatoriosPage />
      </Suspense>
    </RequirePermission>
  ),
});
