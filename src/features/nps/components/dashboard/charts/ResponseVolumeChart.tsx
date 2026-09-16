import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from "./chart-colors";

const ResponseVolumeChart = ({ data }: { data: { created_at: string }[] }) => {
  const volumeData = useMemo(() => {
    const byDay: Record<string, number> = {};
    data.forEach((r) => {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([day, count]) => ({
        day: new Date(day).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        count,
      }));
  }, [data]);

  if (volumeData.length < 2) return null;

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold">
          Volume de Respostas (últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={volumeData}>
            <defs>
              <linearGradient id="volumeBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.9} />
                <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_STYLE} strokeDasharray="3 3" />
            <XAxis dataKey="day" {...AXIS_STYLE} fontSize={10} angle={-45} textAnchor="end" height={50} />
            <YAxis {...AXIS_STYLE} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: COLORS.textMain }}
              labelStyle={{ color: COLORS.textMuted, marginBottom: 4 }}
              formatter={(value: any) => [`${value} resposta(s)`, "Volume"]}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              fill="url(#volumeBarGradient)"
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ResponseVolumeChart;
