import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const DetalheRotaPage = lazy(() =>
  import("~/features/rotas/components/DetalheRotaPage").then((m) => ({ default: m.DetalheRotaPage })),
);

export const rotaDetailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/rotas/$id",
  component: () => {
    const { id } = rotaDetailRoute.useParams();
    return (
      <RequirePermission modulo="rotas" permissions={["rotas_planejar", "rotas_executar"]}>
        <Suspense fallback={null}>
          <DetalheRotaPage id={id} />
        </Suspense>
      </RequirePermission>
    );
  },
});
