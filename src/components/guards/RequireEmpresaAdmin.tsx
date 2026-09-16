import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { Loader2 } from "lucide-react";

type RequireEmpresaAdminProps = {
  redirectTo?: string;
  children: React.ReactNode;
};

export function RequireEmpresaAdmin({
  redirectTo = "/cadastros/dashboard",
  children,
}: RequireEmpresaAdminProps) {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  const isAdmin =
    profile?.is_super_admin || profile?.role === "admin";

  if (!isAdmin) {
    navigate({ to: redirectTo });
    return null;
  }

  return <>{children}</>;
}
