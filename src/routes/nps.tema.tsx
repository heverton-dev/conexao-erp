import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const npsTemaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/nps/tema",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/nps/tema" });
  },
});
