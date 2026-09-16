import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { Loader2 } from "lucide-react";

type RequirePermissionProps = {
  /** Chaves de permissão — se múltiplas, o user precisa ter PELO MENOS UMA (OR) */
  permissions?: string[];
  /** Se true, exige TODAS as permissões (AND) em vez de qualquer uma */
  requireAll?: boolean;
  /** Módulo que o user deve ter acesso (verifica modulosAcesso[key].acessar) */
  modulo?: string;
  /** IDs de páginas nav-item que devem estar em modulosAcesso[key].paginas[] */
  paginas?: string[];
  /** Rota de fallback quando não tem permissão */
  redirectTo?: string;
  children: React.ReactNode;
};

export function RequirePermission({
  permissions,
  requireAll = false,
  modulo,
  paginas,
  redirectTo = "/cadastros/dashboard",
  children,
}: RequirePermissionProps) {
  const { profile, permissoes, modulosAcesso, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  // Super admin sempre passa
  if (profile?.is_super_admin) return <>{children}</>;

  // Check módulo
  if (modulo && modulosAcesso) {
    const moduloAcc = modulosAcesso[modulo];
    if (!moduloAcc?.acessar) {
      navigate({ to: redirectTo });
      return null;
    }
    // Check páginas dentro do módulo
    if (paginas?.length && moduloAcc.paginas) {
      const temPagina = paginas.some((p) => moduloAcc.paginas.includes(p));
      if (!temPagina) {
        navigate({ to: redirectTo });
        return null;
      }
    }
  }

  // Check permissões granulares
  if (permissions?.length) {
    const checks = permissions.map((k) => permissoes?.[k] === true);
    const authorized = requireAll ? checks.every(Boolean) : checks.some(Boolean);
    if (!authorized) {
      navigate({ to: redirectTo });
      return null;
    }
  }

  return <>{children}</>;
}
