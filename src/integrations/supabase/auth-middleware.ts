import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "~/core/supabase";

export const requireSupabaseAuthMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Não autenticado");
  return next({
    context: {
      supabase,
      userId: user.id,
    },
  });
});
