import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Users,
  Star,
  Trophy,
} from "lucide-react";
import { fetchHubMaterials } from "../../services/materials";
import { fetchHubCollections } from "../../services/collections";
import { fetchHubRanking, fetchHubBadges } from "../../services/gamification";

function colorMix(c1: string, w: number, c2: string) {
  return `color-mix(in srgb, ${c1} ${w}%, ${c2})`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: colorMix(
          "var(--color-surface)",
          40,
          "rgba(30,41,59,0.4)",
        ),
      }}
    >
        <div className="flex items-center gap-3 mb-3">
        <div
          className="icon-box-sm group-hover:bg-accent/20 transition-colors"
          style={{ color, borderColor: color + "30" }}
        >
          <Icon size={14} />
        </div>
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-2xl sm:text-3xl font-bold"
        style={{ color: "var(--color-text-main)" }}
      >
        {value}
      </p>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const { empresa } = useAuth();
  const { data: materials = [] } = useQuery({
    queryKey: ["hub-materials", empresa?.id],
    queryFn: () => fetchHubMaterials(empresa!.id),
    enabled: !!empresa?.id,
  });
  const { data: collections = [] } = useQuery({
    queryKey: ["hub-collections", empresa?.id],
    queryFn: () => fetchHubCollections(),
    enabled: !!empresa?.id,
  });
  const { data: ranking = [] } = useQuery({
    queryKey: ["hub-ranking", empresa?.id],
    queryFn: () => fetchHubRanking(),
    enabled: !!empresa?.id,
  });
  const { data: badges = [] } = useQuery({
    queryKey: ["hub-badges", empresa?.id],
    queryFn: () => fetchHubBadges(),
    enabled: !!empresa?.id,
  });

  const totalXp = ranking.reduce(
    (sum: number, u: any) => sum + (u.hub_points || 0),
    0,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text-main)" }}
        >
          Analytics
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Métricas gerais do Hub
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Materiais"
          value={materials.length}
          color="var(--color-accent)"
        />
        <StatCard
          icon={GraduationCap}
          label="Trilhas"
          value={collections.length}
          color="var(--color-success)"
        />
        <StatCard
          icon={Users}
          label="Usuários"
          value={ranking.length}
          color="#3b82f6"
        />
        <StatCard
          icon={Trophy}
          label="Badges"
          value={badges.length}
          color="var(--color-warning)"
        />
      </div>

      <div
        className="rounded-2xl p-6 border"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: colorMix(
            "var(--color-surface)",
            40,
            "rgba(30,41,59,0.4)",
          ),
        }}
      >
        <h3
          className="font-bold mb-4"
          style={{ color: "var(--color-text-main)" }}
        >
          Top Usuários por XP
        </h3>
        {ranking.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Nenhum dado disponível.
          </p>
        ) : (
          <div className="space-y-3">
            {ranking.slice(0, 10).map((u: any, idx: number) => (
              <div key={u.id} className="group flex items-center gap-3">
                <span
                  className="text-xs font-bold w-6 text-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  #{idx + 1}
                </span>
                <div
                  className="flex-1 h-6 rounded-full overflow-hidden bg-surface"
                  style={{
                    backgroundColor: colorMix(
                      "var(--color-surface)",
                      60,
                      "rgba(30,41,59,0.6)",
                    ),
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all flex items-center px-3"
                    style={{
                      width: `${Math.min(100, ((u.hub_points || 0) / Math.max(totalXp, 1)) * 100 * 3)}%`,
                      backgroundColor: "var(--color-accent)",
                    }}
                  >
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: "var(--color-accent-fg)" }}
                    >
                      {u.nome} — {u.hub_points || 0} XP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
