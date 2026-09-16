import { Trophy, Medal } from "lucide-react";
import { useHubRanking, useHubLevels } from "../hooks/useHubGamification";
import { getHubUserLevel } from "../types";

function colorMix(c1: string, w: number, c2: string) {
  return `color-mix(in srgb, ${c1} ${w}%, ${c2})`;
}

export function HubRankingPage() {
  const { data: ranking = [] } = useHubRanking();
  const { data: levels = [] } = useHubLevels();

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
            Ranking
          </h1>
          <p
            className="text-sm sm:text-base max-w-lg font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            Veja os usuários com mais XP no Hub.
          </p>
        </div>
      </div>

      {ranking.length === 0 ? (
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
            Nenhum dado de ranking
          </h3>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Complete materiais para aparecer no ranking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((user: any, index: number) => {
            const levelName = getHubUserLevel(user.hub_points || 0);
            const levelConfig = levels.find((l) => l.name === levelName);
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: colorMix(
                    "var(--color-surface)",
                    40,
                    "rgba(30,41,59,0.4)",
                  ),
                  border: `1px solid ${colorMix("var(--color-border)", 20, "rgba(255,255,255,0.08)")}`,
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center shrink-0">
                  {index === 0 ? (
                    <Trophy size={24} style={{ color: "#ffd700" }} />
                  ) : index === 1 ? (
                    <Medal size={24} style={{ color: "#c0c0c0" }} />
                  ) : index === 2 ? (
                    <Medal size={24} style={{ color: "#cd7f32" }} />
                  ) : (
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      #{index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold truncate"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    {user.nome}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {user.hub_points || 0} XP
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold shrink-0"
                  style={{
                    backgroundColor:
                      levelConfig?.color || "var(--color-accent)",
                    color: "#fff",
                  }}
                >
                  {levelName}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
