import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import {
  Trophy,
  Star,
  BookOpen,
  GraduationCap,
  Rocket,
  Diamond,
  Crown,
  Flame,
  Shield,
  Sparkles,
} from "lucide-react";
import { fetchHubBadges, fetchHubUserBadges } from "../services/gamification";

function colorMix(c1: string, w: number, c2: string) {
  return `color-mix(in srgb, ${c1} ${w}%, ${c2})`;
}
const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  star: Star,
  book: BookOpen,
  graduation: GraduationCap,
  rocket: Rocket,
  trophy: Trophy,
  diamond: Diamond,
  crown: Crown,
  flame: Flame,
  shield: Shield,
  stars: Sparkles,
};

export function HubConquistasPage() {
  const { user, empresa } = useAuth();
  const { data: allBadges = [] } = useQuery({
    queryKey: ["hub-badges", empresa?.id],
    queryFn: () => fetchHubBadges(),
    enabled: !!empresa?.id,
  });
  const { data: userBadges = [] } = useQuery({
    queryKey: ["hub-user-badges", user?.id, empresa?.id],
    queryFn: () => fetchHubUserBadges(user!.id, empresa!.id),
    enabled: !!user?.id && !!empresa?.id,
  });
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(to right, ${colorMix("var(--color-accent)", 10, "rgba(201,166,85,0.1)")}, ${colorMix("var(--color-gradient-mid)", 10, "rgba(232,212,139,0.1)")}, transparent)`,
          }}
        />
        <div className="relative z-10 p-5 sm:p-8 md:p-10">
          <h1
            className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
            style={{ color: "var(--color-text-main)" }}
          >
            Conquistas
          </h1>
          <p
            className="text-sm sm:text-base max-w-lg font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            Badges e conquistas desbloqueados.
          </p>
        </div>
      </div>

      {allBadges.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-[2rem] border border-white/5 text-center px-4"
          style={{
            backgroundColor: colorMix(
              "var(--color-surface)",
              20,
              "rgba(30,41,59,0.2)",
            ),
          }}
        >
          <Trophy
            size={48}
            className="mb-4 opacity-30"
            style={{ color: "var(--color-text-muted)" }}
          />
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: "var(--color-text-main)" }}
          >
            Nenhum badge disponível
          </h3>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Complete materiais e trilhas para desbloquear conquistas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            const Icon = iconMap[badge.icon_name] || Star;
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 ${earned ? "hover:-translate-y-1" : "opacity-40 grayscale"}`}
                style={{
                  backgroundColor: colorMix(
                    "var(--color-surface)",
                    40,
                    "rgba(30,41,59,0.4)",
                  ),
                  border: `1px solid ${colorMix("var(--color-border)", 20, "rgba(255,255,255,0.08)")}`,
                }}
              >
                <div
                  className="icon-box-lg"
                  style={{
                    backgroundColor: badge.color + "20",
                    color: badge.color,
                    borderColor: badge.color + "30",
                  }}
                >
                  <Icon size={24} />
                </div>
                <p
                  className="text-center text-sm font-bold"
                  style={{ color: "var(--color-text-main)" }}
                >
                  {badge.name}
                </p>
                {badge.description && (
                  <p
                    className="text-center text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {badge.description}
                  </p>
                )}
                {badge.points_reward > 0 && (
                  <p
                    className="text-xs font-bold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    +{badge.points_reward} XP
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
