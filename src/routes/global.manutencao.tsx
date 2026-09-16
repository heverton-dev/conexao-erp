import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequireSuperAdmin } from "~/components/guards";

const ManutencaoPanel = lazy(() =>
  import("~/features/manutencao/components/ManutencaoPanel").then((m) => ({ default: m.ManutencaoPanel })),
);

export const globalManutencaoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/manutencao",
  component: () => (
    <RequireSuperAdmin>
      <Suspense fallback={null}>
        <ManutencaoPanel />
      </Suspense>
    </RequireSuperAdmin>
  ),
});
