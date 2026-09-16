import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const npsDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/nps/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/nps/design" });
  },
});
