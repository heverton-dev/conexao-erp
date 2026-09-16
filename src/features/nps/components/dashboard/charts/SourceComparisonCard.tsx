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
  Legend,
} from "recharts";
import { COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from "./chart-colors";

interface SurveyResponse {
  source: string | null;
  nps_score: number | null;
  matrix_facilidade_pedido: number;
  matrix_clareza_condicoes: number;
  matrix_prazo_entrega: number;
  matrix_disponibilidade_produtos: number;
  matrix_comunicacao: number;
}

const SourceComparisonCard = ({ data }: { data: SurveyResponse[] }) => {
  const sourceData = useMemo(() => {
    const sources: Record<
      string,
      { npsScores: number[]; matrixSums: number[]; count: number }
    > = {};

    data.forEach((r) => {
      const src = r.source || "Sem fonte";
      if (!sources[src])
        sources[src] = { npsScores: [], matrixSums: [], count: 0 };
      sources[src].count++;
      if (r.nps_score !== null) sources[src].npsScores.push(r.nps_score);
      const vals = [
        r.matrix_facilidade_pedido,
        r.matrix_clareza_condicoes,
        r.matrix_prazo_entrega,
        r.matrix_disponibilidade_produtos,
        r.matrix_comunicacao,
      ].filter((v) => v > 0);
      if (vals.length)
        sources[src].matrixSums.push(
          vals.reduce((a, b) => a + b, 0) / vals.length,
        );
    });

    return Object.entries(sources)
      .filter(([, v]) => v.count >= 2)
      .map(([source, { npsScores, matrixSums, count }]) => {
        const promoters = npsScores.filter((s) => s >= 9).length;
        const detractors = npsScores.filter((s) => s <= 6).length;
        const nps = npsScores.length
          ? Math.round(((promoters - detractors) / npsScores.length) * 100)
          : 0;
        const avgMatrix = matrixSums.length
          ? Number(
              (
                matrixSums.reduce((a, b) => a + b, 0) / matrixSums.length
              ).toFixed(1),
            )
          : 0;
        return { source, nps, media: avgMatrix, respostas: count };
      })
      .sort((a, b) => b.respostas - a.respostas);
  }, [data]);

  if (sourceData.length < 2) return null;

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold">
          Comparativo por Fonte/Canal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sourceData}>
            <defs>
              <linearGradient id="npsBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.9} />
                <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="mediaBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.info} stopOpacity={0.8} />
                <stop offset="100%" stopColor={COLORS.info} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_STYLE} strokeDasharray="3 3" />
            <XAxis dataKey="source" {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: COLORS.textMain }}
              labelStyle={{ color: COLORS.textMuted, marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: COLORS.textMuted }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="nps" name="NPS" fill="url(#npsBarGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="media" name="Média Critérios" fill="url(#mediaBarGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-3 text-xs" style={{ color: COLORS.textMuted }}>
          {sourceData.map((s) => (
            <span key={s.source}>
              {s.source}: <span className="font-semibold" style={{ color: COLORS.textMain }}>{s.respostas}</span> respostas
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceComparisonCard;
