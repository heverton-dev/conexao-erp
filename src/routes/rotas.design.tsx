import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const rotasDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/rotas/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/rotas/design" });
  },
});
