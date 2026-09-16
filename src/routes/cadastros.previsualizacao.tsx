import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import PrevisualizacaoPage from "~/features/precadastro/PrevisualizacaoPage";
import { RequirePermission } from "~/components/guards";

export const previsualizacaoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/previsualizacao",
  component: () => (
    <RequirePermission
      modulo="cadastros"
      permissions={["ver_todos_cadastros"]}
    >
      <PrevisualizacaoPage />
    </RequirePermission>
  ),
});
