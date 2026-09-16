import { createRoute, Navigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const npsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/nps",
  component: () => <Navigate to="/global/nps" />,
});
