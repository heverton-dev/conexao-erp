import { useState, useCallback } from "react";
import { supabase } from "~/core/supabase";
import { getAllPermissionKeys } from "~/registry";
import { buscarChavesPermissaoDosPerfis } from "../perfis.service";
import type { ModulosAcesso } from "../types";

export function usePermissions() {
  const [permissoes, setPermissoes] = useState<Record<string, boolean> | null>(
    null,
  );
  const [modulosAcesso, setModulosAcesso] = useState<ModulosAcesso | null>(
    null,
  );

  const carregarPermissoesUsuario = useCallback(
    async (userId: string, isSuperAdmin: boolean): Promise<void> => {
      if (isSuperAdmin) {
        const allPerms: Record<string, boolean> = {};
        for (const key of getAllPermissionKeys()) {
          allPerms[key] = true;
        }
        setPermissoes(allPerms);
        setModulosAcesso(null);
        return;
      }

      const [{ data }, chavesDosPerfis] = await Promise.all([
        supabase
          .from("permissoes")
          .select("permissoes, modulos_acesso")
          .eq("usuario_id", userId)
          .maybeSingle(),
        buscarChavesPermissaoDosPerfis(userId).catch(() => [] as string[]),
      ]);

      const flatPerms = {
        ...((data?.permissoes as Record<string, boolean>) || {}),
      };
      for (const key of chavesDosPerfis) {
        flatPerms[key] = true;
      }
      const modulosAcc = data?.modulos_acesso as ModulosAcesso | null;

      if (modulosAcc) {
        for (const [, modulo] of Object.entries(modulosAcc)) {
          if (modulo?.acessar && Array.isArray(modulo.acoes)) {
            for (const acao of modulo.acoes) {
              flatPerms[acao] = true;
            }
          }
        }
      }

      setPermissoes(Object.keys(flatPerms).length > 0 ? flatPerms : null);
      setModulosAcesso(modulosAcc);
    },
    [],
  );

  return {
    permissoes,
    setPermissoes,
    modulosAcesso,
    setModulosAcesso,
    carregarPermissoesUsuario,
  };
}
