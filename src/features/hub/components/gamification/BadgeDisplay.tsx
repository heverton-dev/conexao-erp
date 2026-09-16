import {
  Star,
  BookOpen,
  GraduationCap,
  Rocket,
  Trophy,
  Diamond,
  Crown,
  Flame,
  Shield,
  Sparkles,
} from "lucide-react";
import type { HubBadge } from "../../types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface BadgeDisplayProps {
  badge: HubBadge;
  earned?: boolean;
  compact?: boolean;
}

export function BadgeDisplay({
  badge,
  earned = false,
  compact = false,
}: BadgeDisplayProps) {
  const Icon = iconMap[badge.icon_name] || Star;
  return (
    <div
      className={`flex ${compact ? "items-center gap-2" : "flex-col items-center gap-3"} rounded-xl bg-surface border border-border p-4 transition-all duration-200 hover:border-accent/30 ${earned ? "" : "opacity-40 grayscale"}`}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: badge.color + "20", color: badge.color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      {!compact && (
        <>
          <p className="text-center text-sm font-semibold text-text-main">{badge.name}</p>
          {badge.description && (
            <p className="text-center text-xs text-text-muted">
              {badge.description}
            </p>
          )}
          {badge.points_reward > 0 && (
            <p className="text-xs font-bold text-accent">
              +{badge.points_reward} XP
            </p>
          )}
        </>
      )}
    </div>
  );
}
