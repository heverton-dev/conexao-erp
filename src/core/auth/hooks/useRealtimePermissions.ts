import { useEffect, type RefObject } from "react";
import { supabase } from "~/core/supabase";
import type { Profile } from "../types";

export function useRealtimePermissions(
  userId: string | undefined,
  carregarPermissoesUsuario: (
    userId: string,
    isSuperAdmin: boolean,
  ) => Promise<void>,
  profileRef: RefObject<Profile | null>,
): void {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`permissoes-changes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "permissoes",
          filter: `usuario_id=eq.${userId}`,
        },
        () => {
          carregarPermissoesUsuario(
            userId,
            profileRef.current?.is_super_admin === true,
          ).catch(() => {});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, carregarPermissoesUsuario, profileRef]);
}
