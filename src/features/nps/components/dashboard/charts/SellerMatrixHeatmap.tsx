import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, Grid3x3 } from "lucide-react";
import { computeSellerMetrics, MATRIX_CRITERIA_LABELS } from "~/lib/sellerMetrics";
import { COLORS } from "./chart-colors";

const SellerMatrixHeatmap = ({ data }: { data: any[] }) => {
  const sellers = useMemo(() => computeSellerMetrics(data), [data]);
  if (!sellers.length) return null;

  const colorFor = (v: number) => {
    if (v === 0) return COLORS.border;
    if (v <= 2) return `${COLORS.error}80`;
    if (v <= 3) return `${COLORS.warning}80`;
    if (v <= 4) return `${COLORS.success}66`;
    return `${COLORS.success}b3`;
  };

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <Grid3x3 className="w-4 h-4" style={{ color: COLORS.accent }} />
          Critérios por Vendedor
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
                Heatmap com a média (0–5) de cada critério por vendedor. Vermelho = notas baixas, verde = notas altas.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left font-semibold pr-2 uppercase tracking-wider text-[10px]" style={{ color: COLORS.textMuted }}>Vendedor</th>
              {MATRIX_CRITERIA_LABELS.map((c) => (
                <th key={c.key} className="font-semibold px-1 text-center uppercase tracking-wider text-[10px]" style={{ color: COLORS.textMuted }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.vendor}>
                <td className="font-semibold pr-2 whitespace-nowrap" style={{ color: COLORS.textMain }}>{s.vendor}</td>
                {MATRIX_CRITERIA_LABELS.map((c) => {
                  const v = s.criteria[c.key] || 0;
                  return (
                    <td
                      key={c.key}
                      className="text-center font-bold rounded-lg py-2.5 px-2 min-w-[70px] transition-colors"
                      style={{ backgroundColor: colorFor(v), color: v === 0 ? COLORS.textMuted : COLORS.textMain }}
                      title={`${s.vendor} · ${c.label}: ${v > 0 ? v.toFixed(1) : "sem dados"}`}
                    >
                      {v > 0 ? v.toFixed(1) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-4 text-[10px]" style={{ color: COLORS.textMuted }}>
          <span>1.0</span>
          <div className="flex gap-0.5">
            {[`${COLORS.error}80`, `${COLORS.warning}80`, `${COLORS.success}66`, `${COLORS.success}b3`].map((c, i) => (
              <div key={i} className="w-6 h-3 rounded" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>5.0</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerMatrixHeatmap;
