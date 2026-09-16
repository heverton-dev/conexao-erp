import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, Smile } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { classifySentiment, extractAllText } from "~/lib/sentiment";
import { COLORS, TOOLTIP_STYLE } from "./chart-colors";

const SENTIMENT_COLORS: Record<string, string> = {
  positivo: COLORS.success,
  neutro: COLORS.warning,
  negativo: COLORS.error,
};

const SentimentAnalysis = ({ data }: { data: any[] }) => {
  const chart = useMemo(() => {
    const counts: Record<string, number> = {
      positivo: 0,
      neutro: 0,
      negativo: 0,
    };
    data.forEach((r) => {
      const text = extractAllText(r);
      if (!text.trim()) return;
      counts[classifySentiment(text)]++;
    });
    const total = counts.positivo + counts.neutro + counts.negativo;
    return {
      items: Object.entries(counts).map(([name, value]) => ({ name, value })),
      total,
    };
  }, [data]);

  if (!chart.total) {
    return (
      <Card className="bg-surface border border-border rounded-xl">
        <CardHeader>
          <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
            <Smile className="w-4 h-4" style={{ color: COLORS.accent }} /> Sentimento dos
            Comentários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center py-8" style={{ color: COLORS.textMuted }}>
            Sem comentários no recorte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <Smile className="w-4 h-4" style={{ color: COLORS.accent }} />
          Sentimento dos Comentários
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 cursor-help opacity-60 hover:opacity-100" style={{ color: COLORS.textMuted }} />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[320px] text-xs leading-relaxed"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.textMain }}
              >
                Classificação automática (positivo / neutro / negativo) baseada
                em léxico português. Análise feita no navegador, sem custo de IA.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chart.items}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              dataKey="value"
              stroke={COLORS.surface}
              strokeWidth={2}
              label={({ name, percent }: any) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {chart.items.map((e, i) => (
                <Cell key={i} fill={SENTIMENT_COLORS[e.name]} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: any, n: any) => [`${v} comentário(s)`, n]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {chart.items.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: SENTIMENT_COLORS[item.name] }}
              />
              <span className="capitalize" style={{ color: COLORS.textMuted }}>{item.name}</span>
              <span className="font-semibold" style={{ color: COLORS.textMain }}>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis;
