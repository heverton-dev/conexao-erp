import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const hubDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/hub/design" });
  },
});
