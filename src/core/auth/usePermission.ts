import { useAuth } from "./useAuth";

/**
 * Hook central de checagem de permissão.
 *
 * Mantém exatamente a semântica hoje duplicada ad-hoc em cada componente:
 * super admin (`profile.is_super_admin === true`) sempre tem acesso; caso
 * contrário a checagem cai para `permissoes?.[key] === true` (mesmo bypass
 * que `RequirePermission`/`RequireSuperAdmin` já fazem).
 *
 * Uso:
 *   const podeExcluir = useCan("excluir_cadastro");
 *   const podeVer = useCanAny(["catalogo_colab_ver_produtos", "catalogo_colab_criar_orcamento"]);
 *   const podeGerenciar = useCanAll(["hub_ver_analytics", "hub_gerenciar_config"]);
 */
export function useCan(key: string): boolean {
  const { profile, permissoes } = useAuth();
  if (profile?.is_super_admin === true) return true;
  return permissoes?.[key] === true;
}

/** true se o usuário tiver PELO MENOS UMA das chaves (OR). Super admin sempre passa. */
export function useCanAny(keys: string[]): boolean {
  const { profile, permissoes } = useAuth();
  if (profile?.is_super_admin === true) return true;
  return keys.some((k) => permissoes?.[k] === true);
}

/** true se o usuário tiver TODAS as chaves (AND). Super admin sempre passa. */
export function useCanAll(keys: string[]): boolean {
  const { profile, permissoes } = useAuth();
  if (profile?.is_super_admin === true) return true;
  return keys.every((k) => permissoes?.[k] === true);
}
