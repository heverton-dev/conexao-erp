import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const linktreeTemaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/linktree/tema",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/linktree/tema" });
  },
});
