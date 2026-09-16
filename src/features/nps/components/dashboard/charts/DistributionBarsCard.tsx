import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, LucideIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from "./chart-colors";

interface DistributionBarsCardProps {
  data: any[];
  field: string;
  title: string;
  hint: string;
  order: string[];
  colorMap?: Record<string, string>;
  icon?: LucideIcon;
  layout?: "horizontal" | "vertical";
}

const DistributionBarsCard = ({
  data,
  field,
  title,
  hint,
  order,
  colorMap,
  icon: Icon,
  layout = "horizontal",
}: DistributionBarsCardProps) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const v = r[field];
      if (typeof v === "string" && v.trim()) counts[v] = (counts[v] || 0) + 1;
    });
    const sortedKeys = [
      ...order.filter((k) => counts[k]),
      ...Object.keys(counts).filter((k) => !order.includes(k)),
    ];
    return sortedKeys.map((name) => ({ name, value: counts[name] }));
  }, [data, field, order]);

  if (!chartData.length) {
    return (
      <Card className="bg-surface border border-border rounded-xl">
        <CardHeader>
          <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" style={{ color: COLORS.accent }} />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center py-8" style={{ color: COLORS.textMuted }}>Sem dados nesse recorte.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: COLORS.accent }} />}
          {title}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 cursor-help opacity-60 hover:opacity-100" style={{ color: COLORS.textMuted }} />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[300px] text-xs leading-relaxed"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textMain }}
              >
                {hint}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 42)}>
          <BarChart data={chartData} layout={layout === "vertical" ? "vertical" : "horizontal"}>
            <CartesianGrid {...GRID_STYLE} strokeDasharray="3 3" />
            {layout === "vertical" ? (
              <>
                <XAxis type="number" {...AXIS_STYLE} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={140} {...AXIS_STYLE} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" {...AXIS_STYLE} fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis {...AXIS_STYLE} allowDecimals={false} />
              </>
            )}
            <RechartsTooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: COLORS.textMain }}
              labelStyle={{ color: COLORS.textMuted, marginBottom: 4 }}
              formatter={(value: any) => [`${value} resposta(s)`, "Quantidade"]}
            />
            <Bar
              dataKey="value"
              radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              maxBarSize={28}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={colorMap?.[entry.name] || COLORS.accent} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DistributionBarsCard;
