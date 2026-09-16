import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const cadastrosDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/cadastros/design" });
  },
});
