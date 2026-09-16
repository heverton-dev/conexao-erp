import { Link, useMatches } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Settings,
  BarChart3,
  Users,
} from "lucide-react";
import { useAuth } from "~/lib/auth";
import { cn } from "~/lib/utils";
import { getHubUserLevel, HUB_LEVEL_THRESHOLDS } from "../../types";

const navItems = [
  {
    label: "Dashboard",
    icon: BookOpen,
    to: "/hub/dashboard",
    perm: "hub_ver_materiais",
  },
  {
    label: "Trilhas",
    icon: GraduationCap,
    to: "/hub/trilhas",
    perm: "hub_ver_trilhas",
  },
  {
    label: "Ranking",
    icon: Trophy,
    to: "/hub/ranking",
    perm: "hub_ver_ranking",
  },
  {
    label: "Conquistas",
    icon: Trophy,
    to: "/hub/conquistas",
    perm: "hub_ver_conquistas",
  },
  {
    label: "Admin",
    icon: Settings,
    to: "/hub/admin",
    perm: "hub_gerenciar_config",
  },
  {
    label: "Gestor",
    icon: Users,
    to: "/hub/gestor",
    perm: "hub_ver_analytics",
  },
];

export function HubSidebar() {
  const { permissoes } = useAuth();
  const matches = useMatches();
  const currentPath = matches.at(-1)?.pathname || "";

  const userPoints = 0;
  const level = getHubUserLevel(userPoints);
  const nextThreshold = HUB_LEVEL_THRESHOLDS[level] || 1000;
  const progress = Math.min((userPoints / nextThreshold) * 100, 100);

  const visibleItems = navItems.filter((item) => {
    if (item.perm === "hub_gerenciar_config")
      return permissoes?.hub_gerenciar_config === true;
    if (item.perm === "hub_ver_analytics")
      return (
        permissoes?.hub_ver_analytics === true &&
        permissoes?.hub_gerenciar_config !== true
      );
    return permissoes?.[item.perm] === true;
  });

  return (
    <aside className="hidden w-full sm:w-64 border-r border-border bg-card lg:block">
      <div className="p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-main">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent shrink-0"><BookOpen className="h-4 w-4" /></span>
          Conexão Hub
        </h2>

        <div className="mb-4 rounded-xl bg-surface border border-border p-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-semibold text-text-main">{level}</span>
            <span className="text-text-muted">{userPoints} XP</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {nextThreshold - userPoints} XP para o próximo nível
          </p>
        </div>

        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 min-h-[44px]",
                  isActive
                    ? "bg-accent/10 text-accent font-semibold border border-accent/20"
                    : "text-text-muted hover:bg-surface hover:text-text-main hover:border-border",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
