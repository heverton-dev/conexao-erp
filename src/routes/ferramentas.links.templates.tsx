import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const TemplateManager = lazy(() =>
  import("~/features/gerador-links/components/TemplateManager").then((m) => ({
    default: m.TemplateManager,
  })),
);

export const ferramentasLinksTemplatesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/templates",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_gerenciar_templates"]}>
      <Suspense fallback={null}>
        <TemplateManager />
      </Suspense>
    </RequirePermission>
  ),
});
