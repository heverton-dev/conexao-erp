import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const funisDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/funis/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/funis/design" });
  },
});
