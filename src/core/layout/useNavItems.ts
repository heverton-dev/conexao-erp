import {
  LayoutDashboard,
  Users,
  BarChart3,
  Link2,
  Shield,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "~/core/auth";

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  matchPaths?: string[];
};

export function useNavItems() {
  const { profile, permissoes } = useAuth();
  const amb = profile?.ambiente;
  const p = permissoes;

  const navItems: NavItem[] = [
    ...(p?.ver_todos_cadastros === true
      ? [{ path: "/cadastros/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
    ...(p?.gerar_links === true
      ? [
          {
            path: "/cadastros/consultor",
            label: amb === "consultor" ? "Gerar Links" : "Consultor",
            icon: Link2,
          },
        ]
      : []),
    ...(p?.ver_todos_cadastros === true || p?.gerar_links === true
      ? [
          {
            path: "/cadastros/solicitacoes",
            label: "Solicitações",
            icon: Users,
            matchPaths: ["/cadastros/solicitacoes/$id"],
          },
        ]
      : []),
    ...(p?.ver_todos_cadastros === true || p?.gerar_links === true
      ? [
          {
            path: "/cadastros/clientes",
            label: "Clientes",
            icon: Users,
          },
        ]
      : []),
    ...(p?.ver_relatorios === true
      ? [{ path: "/cadastros/relatorios", label: "Relatórios", icon: BarChart3 }]
      : []),
    ...(p?.gerenciar_credenciais === true
      ? [{ path: "/credenciais", label: "Credenciais", icon: Shield }]
      : []),
    ...(p?.gerenciar_config === true
      ? [{ path: "/global/acoes", label: "Config", icon: Settings }]
      : []),
  ];

  return navItems;
}
