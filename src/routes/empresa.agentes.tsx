import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";
const AgentesPage = lazy(() =>
  import("~/features/agentes/components/AgentesPage").then((m) => ({ default: m.AgentesPage })),
);

export const empresaAgentesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/agentes",
  component: () => (
    <RequirePermission modulo="agentes-ia" permissions={["agentes_ver"]}>
      <Suspense fallback={null}>
        <AgentesPage />
      </Suspense>
    </RequirePermission>
  ),
});
