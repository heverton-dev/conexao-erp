import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { COLORS } from "./chart-colors";

const computeNps = (rows: any[]) => {
  const scored = rows.filter((r) => r.nps_score !== null && r.nps_score !== undefined);
  if (!scored.length) return { nps: 0, count: 0 };
  const promoters = scored.filter((r) => r.nps_score >= 9).length;
  const detractors = scored.filter((r) => r.nps_score <= 6).length;
  return {
    nps: Math.round(((promoters - detractors) / scored.length) * 100),
    count: scored.length,
  };
};

const MonthOverMonthCard = ({ data }: { data: any[] }) => {
  const { current, previous, delta } = useMemo(() => {
    const now = new Date();
    const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrev = startCurrent;
    const cur = data.filter((r) => new Date(r.created_at) >= startCurrent);
    const prev = data.filter((r) => {
      const d = new Date(r.created_at);
      return d >= startPrev && d < endPrev;
    });
    const c = computeNps(cur);
    const p = computeNps(prev);
    return { current: c, previous: p, delta: c.nps - p.nps };
  }, [data]);

  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? COLORS.success : delta < 0 ? COLORS.error : COLORS.textMuted;
  const trendBg = delta > 0 ? "rgba(34,197,94,0.15)" : delta < 0 ? "rgba(239,68,68,0.15)" : "rgba(51,65,85,0.3)";

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          Comparativo Mês a Mês
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
                NPS do mês atual comparado ao mês anterior. Delta = variação em pontos NPS.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(51,65,85,0.2)" }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: COLORS.textMuted }}>Mês anterior</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.textMain }}>{previous.nps}</p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{previous.count} respostas</p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: `${COLORS.accent}1a` }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: COLORS.accent }}>Mês atual</p>
            <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{current.nps}</p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{current.count} respostas</p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: trendBg }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: COLORS.textMuted }}>Variação</p>
            <p className="text-2xl font-bold flex items-center gap-1" style={{ color: trendColor }}>
              <TrendIcon className="w-5 h-5" />
              {delta > 0 ? "+" : ""}{delta}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>pontos NPS</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthOverMonthCard;
