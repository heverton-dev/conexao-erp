import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const TemplateManager = lazy(() =>
  import("~/features/funis/components/TemplateManager").then((m) => ({
    default: m.TemplateManager,
  })),
);

export const funisTemplatesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/funis/templates",
  component: () => (
    <RequirePermission modulo="funis" permissions={["funis_criar_funil"]}>
      <Suspense fallback={null}>
        <TemplateManager />
      </Suspense>
    </RequirePermission>
  ),
});
