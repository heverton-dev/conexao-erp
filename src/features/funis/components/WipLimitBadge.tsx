import { AlertTriangle } from "lucide-react";

type WipLimitBadgeProps = {
  current: number;
  limit: number | null;
};

export function WipLimitBadge({ current, limit }: WipLimitBadgeProps) {
  if (!limit || limit <= 0) return null;

  const isAtLimit = current >= limit;
  const isNearLimit = current >= limit * 0.8;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
        isAtLimit
          ? "bg-red-500/15 text-red-400 border border-red-500/30"
          : isNearLimit
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            : "bg-muted text-muted-foreground border border-border/40"
      }`}
    >
      {isAtLimit && <AlertTriangle className="h-2.5 w-2.5" />}
      {current}/{limit}
    </span>
  );
}
