import { useAuth } from "~/lib/auth";
import { Badge } from "~/components/ui/badge";

interface PermissionBadgeProps {
  permissionKey: string;
  label: string;
}

export function PermissionBadge({
  permissionKey,
  label,
}: PermissionBadgeProps) {
  const { permissoes } = useAuth();
  const hasPermission = permissoes?.[permissionKey] === true;

  if (!hasPermission) return null;

  return <Badge variant="success">{label}</Badge>;
}
