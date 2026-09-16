import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { Loader2 } from "lucide-react";

type RequireSuperAdminProps = {
  redirectTo?: string;
  children: React.ReactNode;
};

export function RequireSuperAdmin({
  redirectTo = "/cadastros/dashboard",
  children,
}: RequireSuperAdminProps) {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!profile?.is_super_admin) {
    navigate({ to: redirectTo });
    return null;
  }

  return <>{children}</>;
}
