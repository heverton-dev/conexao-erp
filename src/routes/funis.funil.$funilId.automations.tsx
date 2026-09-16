import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const AutomationRules = lazy(() =>
  import("~/features/funis/components/AutomationRules").then((m) => ({
    default: m.AutomationRules,
  })),
);

export const funilAutomationsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/funis/funil/$funilId/automations",
  component: () => (
    <RequirePermission modulo="funis" permissions={["funis_gerir_colunas"]}>
      <Suspense fallback={null}>
        <AutomationRules />
      </Suspense>
    </RequirePermission>
  ),
});
