import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const CriativosList = lazy(() =>
  import("~/features/marketing/criativos/components/CriativosList").then((m) => ({
    default: m.CriativosList,
  })),
);

export const marketingCriativosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/criativos",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_criativo_ver"]}>
      <Suspense fallback={null}>
        <CriativosList />
      </Suspense>
    </RequirePermission>
  ),
});
