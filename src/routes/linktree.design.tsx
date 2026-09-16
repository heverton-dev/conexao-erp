import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const linktreeDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/linktree/design",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/linktree/design" });
  },
});
