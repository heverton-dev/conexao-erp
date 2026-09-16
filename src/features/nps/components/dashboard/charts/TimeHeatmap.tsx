import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, Clock } from "lucide-react";
import { COLORS } from "./chart-colors";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOUR_BUCKETS = [
  { label: "0-3h", range: [0, 3] },
  { label: "4-7h", range: [4, 7] },
  { label: "8-11h", range: [8, 11] },
  { label: "12-15h", range: [12, 15] },
  { label: "16-19h", range: [16, 19] },
  { label: "20-23h", range: [20, 23] },
];

const TimeHeatmap = ({ data }: { data: any[] }) => {
  const { grid, max } = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(HOUR_BUCKETS.length).fill(0));
    let m = 0;
    data.forEach((r) => {
      const d = new Date(r.created_at);
      const dow = d.getDay();
      const hour = d.getHours();
      const bucket = HOUR_BUCKETS.findIndex((b) => hour >= b.range[0] && hour <= b.range[1]);
      if (bucket >= 0) {
        g[dow][bucket]++;
        if (g[dow][bucket] > m) m = g[dow][bucket];
      }
    });
    return { grid: g, max: m };
  }, [data]);

  const getIntensityColor = (value: number) => {
    if (value === 0) return COLORS.border;
    const intensity = max ? value / max : 0;
    if (intensity < 0.25) return `${COLORS.accent}33`;
    if (intensity < 0.5) return `${COLORS.accent}66`;
    if (intensity < 0.75) return `${COLORS.accent}99`;
    return `${COLORS.accent}cc`;
  };

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: COLORS.accent }} />
          Horários de Resposta
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
                Mapa de calor cruzando dia da semana × faixa horária. Quanto mais escuro, mais respostas.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left font-medium pr-2" style={{ color: COLORS.textMuted }}></th>
                {HOUR_BUCKETS.map((b) => (
                  <th key={b.label} className="font-medium px-1 text-center" style={{ color: COLORS.textMuted }}>{b.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, i) => (
                <tr key={day}>
                  <td className="font-medium pr-2 text-right" style={{ color: COLORS.textMuted }}>{day}</td>
                  {HOUR_BUCKETS.map((_, j) => {
                    const v = grid[i][j];
                    return (
                      <td
                        key={j}
                        className="text-center font-medium rounded-md py-2 px-1"
                        style={{ backgroundColor: getIntensityColor(v), color: COLORS.textMain }}
                        title={`${day} ${HOUR_BUCKETS[j].label}: ${v} resposta(s)`}
                      >
                        {v || ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px]" style={{ color: COLORS.textMuted }}>
          <span>Menos</span>
          <div className="flex gap-1">
            {[COLORS.border, `${COLORS.accent}33`, `${COLORS.accent}66`, `${COLORS.accent}99`, `${COLORS.accent}cc`].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeHeatmap;
