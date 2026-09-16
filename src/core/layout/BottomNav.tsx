import { useNavigate, useLocation } from "@tanstack/react-router";
import { cn } from "~/core/utils";
import { useNavItems, type NavItem } from "./useNavItems";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = useNavItems();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-header-bg/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {(() => {
          const path = location.pathname;
          const matchScore = (item: NavItem) =>
            path === item.path
              ? 3
              : (item.matchPaths || []).includes(path)
                ? 2
                : path.startsWith(item.path + "/")
                  ? 1
                  : 0;
          const bestMatch = navItems.reduce<string | null>((best, item) => {
            const score = matchScore(item);
            if (!score) return best;
            if (!best) return item.path;
            const bestScore = matchScore(
              navItems.find((i) => i.path === best)!,
            );
            if (score > bestScore) return item.path;
            if (score < bestScore) return best;
            return item.path.length > best.length ? item.path : best;
          }, null);
          return navItems.map((item) => {
            const isActive = bestMatch === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={cn(
                  "flex min-h-[48px] items-center justify-center px-1 py-1 transition-colors",
                  isActive
                    ? "text-accent"
                    : "text-text-muted hover:text-text-main",
                )}
              >
                <item.icon size={18} />
              </button>
            );
          });
        })()}
      </div>
    </nav>
  );
}
