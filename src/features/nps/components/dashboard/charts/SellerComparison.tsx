import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, BarChart3 } from "lucide-react";
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
import { computeSellerMetrics } from "~/lib/sellerMetrics";
import { COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE, npsColor } from "./chart-colors";

const SellerComparison = ({ data }: { data: any[] }) => {
  const chartData = useMemo(
    () =>
      computeSellerMetrics(data).map((s) => ({
        name: s.vendor,
        nps: s.nps,
        total: s.total,
      })),
    [data],
  );

  if (!chartData.length) return null;

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: COLORS.accent }} />
          NPS por Vendedor
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
                Comparativo direto do NPS de cada vendedor. Cor segue o padrão semântico: verde (≥50), amarelo (0–49), vermelho (&lt;0).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer
          width="100%"
          height={Math.max(220, chartData.length * 36)}
        >
          <BarChart data={chartData} layout="vertical">
            <defs>
              <linearGradient id="sellerGreen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.5} />
                <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="sellerYellow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.warning} stopOpacity={0.5} />
                <stop offset="100%" stopColor={COLORS.warning} stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="sellerRed" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.error} stopOpacity={0.5} />
                <stop offset="100%" stopColor={COLORS.error} stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_STYLE} strokeDasharray="3 3" />
            <XAxis type="number" domain={[-100, 100]} {...AXIS_STYLE} />
            <YAxis type="category" dataKey="name" width={120} {...AXIS_STYLE} />
            <RechartsTooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: COLORS.textMain }}
              labelStyle={{ color: COLORS.textMuted, marginBottom: 4 }}
              formatter={(value: any, _name: any, props: any) => [
                `NPS ${value} (${props.payload.total} respostas)`,
                "NPS",
              ]}
            />
            <Bar dataKey="nps" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {chartData.map((d, i) => (
                <Cell
                  key={i}
                  fill={npsColor(d.nps) === COLORS.success ? "url(#sellerGreen)" : npsColor(d.nps) === COLORS.warning ? "url(#sellerYellow)" : "url(#sellerRed)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SellerComparison;
