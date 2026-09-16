import { useMemo } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { cn } from "~/lib/utils";
import { useNavItems } from "./useNavItems";

export function BottomNav({
  selectedModuleKey,
}: {
  selectedModuleKey?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const allSections = useNavItems();
  const navItems = useMemo(() => {
    const section = selectedModuleKey
      ? allSections.find((s) => s.key === selectedModuleKey)
      : allSections[0];
    return section?.items ?? [];
  }, [allSections, selectedModuleKey]);

  const path = location.pathname;
  const matchScore = (item: { path: string; matchPaths?: string[] }) =>
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
    const bestScore = matchScore(navItems.find((i) => i.path === best)!);
    if (score > bestScore) return item.path;
    if (score < bestScore) return best;
    return item.path.length > best.length ? item.path : best;
  }, null);

  const maxItems = 5;
  const visibleItems = navItems.slice(0, maxItems);
  const overflowItems =
    navItems.length > maxItems ? navItems.slice(maxItems) : [];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-header-bg/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      role="navigation"
      aria-label="Navegação mobile"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5 pb-1">
        {visibleItems.map((item) => {
          const isActive = bestMatch === item.path;
          if (item.external) {
            return (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex flex-col items-center justify-center min-w-[48px] min-h-[44px] rounded-lg text-text-muted hover:text-text-main transition-colors duration-150"
              >
                <item.icon size={22} />
              </a>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center min-w-[48px] min-h-[44px] rounded-lg transition-colors duration-150",
                isActive
                  ? "text-accent"
                  : "text-text-muted hover:text-text-main",
              )}
            >
              <item.icon size={22} />
              {isActive && (
                <span className="mt-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
        {overflowItems.length > 0 && (
          <button
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[44px] rounded-lg text-text-muted hover:text-text-main transition-colors duration-150"
            aria-label="Mais opções"
          >
            <span className="text-lg leading-none font-bold">···</span>
          </button>
        )}
      </div>
    </nav>
  );
}
