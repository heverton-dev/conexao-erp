import { createRoute, redirect } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const hubAdminChatbotRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/hub/admin/chatbot",
  beforeLoad: () => {
    throw redirect({ to: "/empresa/hub/chatbot" });
  },
});
