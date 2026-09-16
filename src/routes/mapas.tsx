import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { Navigate } from "@tanstack/react-router";

export const mapasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/mapas",
  component: () => <Navigate to="/mapas/distribuidores" />,
});
