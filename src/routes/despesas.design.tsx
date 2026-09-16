import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const despesasDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/despesas/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/despesas/design" });
  },
});
