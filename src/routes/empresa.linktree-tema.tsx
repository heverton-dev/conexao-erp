import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
const LinktreeTemaPage = lazy(() =>
  import("~/features/linktree/components/LinktreeTemaPage").then((m) => ({ default: m.LinktreeTemaPage })),
);
import { RequirePermission } from "~/components/guards";

export const empresaLinktreeTemaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/linktree/tema",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <Suspense fallback={null}>
        <LinktreeTemaPage />
      </Suspense>
    </RequirePermission>
  ),
});
