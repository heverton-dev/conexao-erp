import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from "./chart-colors";

interface SurveyResponse {
  created_at: string;
  nps_score: number | null;
}

const NPSTrendChart = ({ data }: { data: SurveyResponse[] }) => {
  const trendData = useMemo(() => {
    const scored = data.filter((r) => r.nps_score !== null);
    if (!scored.length) return [];

    const byWeek: Record<
      string,
      { promoters: number; detractors: number; total: number }
    > = {};

    scored.forEach((r) => {
      const d = new Date(r.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);

      if (!byWeek[key]) byWeek[key] = { promoters: 0, detractors: 0, total: 0 };
      byWeek[key].total++;
      if (r.nps_score! >= 9) byWeek[key].promoters++;
      if (r.nps_score! <= 6) byWeek[key].detractors++;
    });

    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, { promoters, detractors, total }]) => ({
        week: new Date(week).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        nps: Math.round(((promoters - detractors) / total) * 100),
      }));
  }, [data]);

  if (trendData.length < 2) return null;

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold">
          Evolução do NPS (semanal)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="npsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_STYLE} strokeDasharray="3 3" />
            <XAxis dataKey="week" {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} domain={[-100, 100]} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: COLORS.textMain }}
              labelStyle={{ color: COLORS.textMuted, marginBottom: 4 }}
              formatter={(value: any) => [`${value}`, "NPS"]}
            />
            <Area
              type="monotone"
              dataKey="nps"
              stroke={COLORS.accent}
              strokeWidth={2.5}
              fill="url(#npsAreaGradient)"
              dot={{ fill: COLORS.accent, r: 4, strokeWidth: 2, stroke: COLORS.surface }}
              activeDot={{ r: 6, fill: COLORS.accent, stroke: COLORS.surface, strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default NPSTrendChart;
