import { Trophy, Medal } from "lucide-react";
import { getHubUserLevel } from "../../types";
import type { HubGamificationLevel } from "../../types";

interface RankingEntry {
  id: string;
  nome: string;
  hub_points: number;
  avatar_url?: string;
}

interface RankingBoardProps {
  ranking: RankingEntry[];
  levels: HubGamificationLevel[];
}

export function RankingBoard({ ranking, levels }: RankingBoardProps) {
  return (
    <div className="space-y-3">
      {ranking.length === 0 && (
        <p className="py-8 text-center text-text-muted">
          Nenhum dado de ranking disponível.
        </p>
      )}
      {ranking.map((user, index) => {
        const levelName = getHubUserLevel(user.hub_points);
        const levelConfig = levels.find((l) => l.name === levelName);
        return (
          <div
            key={user.id}
            className="flex items-center gap-3 sm:gap-4 rounded-xl bg-surface border border-border p-3 sm:p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center shrink-0">
              {index === 0 ? (
                <Trophy className="h-6 w-6 text-yellow-500" />
              ) : index === 1 ? (
                <Medal className="h-6 w-6 text-gray-400" />
              ) : index === 2 ? (
                <Medal className="h-6 w-6 text-amber-600" />
              ) : (
                <span className="text-sm font-bold text-text-muted">
                  #{index + 1}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-main truncate">{user.nome}</p>
              <p className="text-sm text-text-muted">
                {user.hub_points} XP
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold shrink-0"
              style={{
                backgroundColor: levelConfig?.color || "#6366f1",
                color: "white",
              }}
            >
              {levelName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
