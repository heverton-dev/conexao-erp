import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
  accent?: string;
  accentBg?: string;
  gradientFrom?: string;
  gradientVia?: string;
  borderColor?: string;
  shadowColor?: string;
  trend?: number;
  trendLabel?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
  progressGradient?: string;
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  hint,
  accent = "text-text-main",
  accentBg = "bg-accent/15",
  gradientFrom = "from-accent/20",
  gradientVia = "via-accent/10",
  borderColor = "border-accent/20",
  shadowColor = "shadow-accent/10",
  trend,
  trendLabel,
  showProgress = false,
  progressValue = 0,
  progressMax = 100,
  progressGradient = "from-accent to-accent-hover",
}: MetricCardProps) => {
  const trendPositive = trend && trend > 0;
  const trendNegative = trend && trend < 0;

  const TrendIcon = trendPositive ? TrendingUp : trendNegative ? TrendingDown : Minus;

  const trendBg = trendPositive
    ? "bg-green-500/10 text-green-400"
    : trendNegative
      ? "bg-red-500/10 text-red-400"
      : "bg-secondary text-muted-foreground";

  const progressPercent = Math.min((progressValue / progressMax) * 100, 100);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientVia} to-transparent border ${borderColor} p-5 transition-all duration-300 hover:shadow-lg hover:${shadowColor} hover:${borderColor.replace("/20", "/40")}`}
    >
      <div
        className={`absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl ${accentBg} ${accent} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon size={22} />
      </div>

      <p className={`text-xs font-semibold ${accent} uppercase tracking-wider opacity-80`}>
        {label}
      </p>

      <div className="flex items-center gap-2 mt-2">
        <p className="text-3xl sm:text-4xl font-bold text-text-main">
          {value}
        </p>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${trendBg}`}
          >
            <TrendIcon className="w-3 h-3" />
            <span>
              {trendPositive ? "+" : ""}
              {trend}%
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted mt-2">{hint}</p>

      {showProgress && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-1000`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {trendLabel && (
            <p className="text-[10px] text-text-muted mt-1">{trendLabel}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
