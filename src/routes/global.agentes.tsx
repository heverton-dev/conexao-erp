import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequireSuperAdmin } from "~/components/guards";

const GlobalAgentesPage = lazy(() =>
  import("~/features/agentes/components/GlobalAgentesPage").then((m) => ({ default: m.GlobalAgentesPage })),
);

export const globalAgentesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/agentes",
  component: () => (
    <RequireSuperAdmin>
      <Suspense fallback={null}>
        <GlobalAgentesPage />
      </Suspense>
    </RequireSuperAdmin>
  ),
});
