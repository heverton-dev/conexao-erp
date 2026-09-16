import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const mapasDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/mapas/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/mapas/design" });
  },
});
