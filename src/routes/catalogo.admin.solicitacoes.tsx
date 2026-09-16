
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { SolicitacoesAdmin } from "~/features/catalogo/components/SolicitacoesAdmin"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"

export const catalogoAdminSolicitacoesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/solicitacoes",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_solicitacoes"]}>
      <EmpresaCrudGuard>
        <SolicitacoesAdmin />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})
