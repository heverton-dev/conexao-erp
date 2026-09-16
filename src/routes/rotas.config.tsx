import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const rotasConfigRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/rotas/config",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/rotas/config" });
  },
});
