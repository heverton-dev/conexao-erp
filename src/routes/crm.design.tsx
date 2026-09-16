import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const crmDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/crm/design" });
  },
});
