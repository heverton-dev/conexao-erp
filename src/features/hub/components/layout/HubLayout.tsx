import { Outlet } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { LogOut, Globe, Star } from "lucide-react";
import { getHubUserLevel } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { fetchHubLevels } from "../../services/gamification";
import { HubGlobalEffects } from "../shared/GlobalEffects";

function colorMix(c1: string, w: number, c2: string) {
  return `color-mix(in srgb, ${c1} ${w}%, ${c2})`;
}

export function HubLayout() {
  const { user, logout, empresa, profile } = useAuth();
  const { data: levels = [] } = useQuery({
    queryKey: ["hub-levels", empresa?.id],
    queryFn: () => fetchHubLevels(),
    enabled: !!empresa?.id,
  });

  const userPoints = (user as any)?.hub_points || 0;
  const levelName = getHubUserLevel(userPoints);
  const levelColor = (() => {
    if (!user || levels.length === 0) return null;
    const sorted = [...levels].sort((a, b) => b.min_points - a.min_points);
    return sorted.find((l) => userPoints >= l.min_points)?.color || null;
  })();

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-500 relative"
      style={{ background: "var(--color-bg)" }}
    >
      <HubGlobalEffects />
      <header className="sticky top-0 z-40 w-full px-2 sm:px-4 pt-2 sm:pt-4 pointer-events-none">
        <div className="container mx-auto">
          <div
            className="rounded-2xl p-2 pl-3 sm:p-3 sm:pl-5 flex justify-between items-center pointer-events-auto transition-all duration-500 relative overflow-hidden"
            style={{
              background: levelColor
                ? `linear-gradient(135deg, ${levelColor}12 0%, ${colorMix("var(--color-header-bg)", 80, "rgba(15,23,42,0.8)")} 50%, ${levelColor}08 100%)`
                : `linear-gradient(135deg, ${colorMix("var(--color-glass-tint)", 25, "rgba(30,41,59,0.25)")} 0%, ${colorMix("var(--color-header-bg)", 80, "rgba(15,23,42,0.8)")} 50%, ${colorMix("var(--color-glass-tint)", 15, "rgba(30,41,59,0.15)")} 100%)`,
              backdropFilter:
                "blur(var(--env-glass-blur, 20px)) saturate(180%)",
              WebkitBackdropFilter:
                "blur(var(--env-glass-blur, 20px)) saturate(180%)",
              border: levelColor
                ? `1px solid ${levelColor}25`
                : `1px solid ${colorMix("var(--color-glass-tint)", 20, "rgba(255,255,255,0.1)")}`,
              boxShadow: levelColor
                ? `0 0 20px ${levelColor}08, inset 0 0 30px ${levelColor}05`
                : `0 8px 32px var(--color-shadow), inset 0 1px 0 ${colorMix("var(--color-glass-tint)", 30, "rgba(255,255,255,0.12)")}, inset 0 -1px 0 ${colorMix("var(--color-glass-tint)", 10, "rgba(255,255,255,0.04)")}`,
            }}
          >
            <div className="flex items-center space-x-4 group cursor-default">
              <div className="relative">
                <div
                  className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
                <div
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)",
                  }}
                >
                  CH
                </div>
              </div>
              <h1
                className="text-xl font-bold hidden sm:block tracking-tight"
                style={{ color: "var(--color-text-main)" }}
              >
                Conexão Hub
              </h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div
                className="flex items-center gap-1 sm:gap-2 rounded-full px-1 py-1 sm:px-1.5 sm:py-1.5"
                style={{
                  backgroundColor: colorMix(
                    "var(--color-bg)",
                    50,
                    "rgba(15,23,42,0.5)",
                  ),
                  border: `1px solid ${colorMix("var(--color-border)", 50, "rgba(255,255,255,0.1)")}`,
                }}
              >
                <div
                  className="p-1 sm:p-1.5 rounded-full shadow-sm"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <Globe size={14} />
                </div>
                <span
                  className="text-[10px] sm:text-xs font-bold uppercase pr-1 sm:pr-2"
                  style={{ color: "var(--color-text-main)" }}
                >
                  PT
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 pl-1 sm:pl-2">
                <div
                  className="flex items-center gap-2 sm:gap-3 rounded-full p-1 pr-2 sm:pr-4 cursor-default"
                  style={{
                    backgroundColor: colorMix(
                      "var(--color-bg)",
                      50,
                      "rgba(15,23,42,0.5)",
                    ),
                    border: `1px solid ${colorMix("var(--color-border)", 50, "rgba(255,255,255,0.1)")}`,
                  }}
                >
                  <div
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)",
                      color: "var(--color-accent-fg)",
                    }}
                  >
                    {profile?.nome?.charAt(0) || "U"}
                  </div>
                  <div className="hidden md:block leading-none">
                    <p
                      className="text-xs font-bold"
                      style={{ color: "var(--color-text-main)" }}
                    >
                      {profile?.nome?.split(" ")[0]}
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-wide font-semibold mt-0.5 flex items-center gap-1"
                      style={{ color: levelColor || "var(--color-accent)" }}
                    >
                      <Star
                        size={8}
                        style={{
                          fill: levelColor || "var(--color-warning)",
                          color: levelColor || "var(--color-warning)",
                        }}
                      />
                      {levelName} · {userPoints} XP
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="group relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:text-white hover:shadow-lg"
                  style={{
                    backgroundColor: "var(--color-error-bg)",
                    color: "var(--color-error)",
                  }}
                  title="Sair"
                >
                  <LogOut
                    size={16}
                    className="sm:hidden transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                  <LogOut
                    size={18}
                    className="hidden sm:block transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main
        className="flex-1 container mx-auto p-3 sm:p-4 md:p-6 mt-2 sm:mt-4 animate-fade-in relative z-10"
        style={{ color: "var(--color-text-main)" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
