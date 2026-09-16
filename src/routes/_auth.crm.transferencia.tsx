import { createRoute, Outlet } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

export const crmTransferenciaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/transferencia",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_transferencia"]}>
      <Outlet />
    </RequirePermission>
  ),
});
