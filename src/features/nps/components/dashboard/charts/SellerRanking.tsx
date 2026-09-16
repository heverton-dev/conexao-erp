import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, Trophy, ArrowUpDown } from "lucide-react";
import { computeSellerMetrics, SellerMetric } from "~/lib/sellerMetrics";
import { COLORS, npsColor, npsBg } from "./chart-colors";

type SortKey = "nps" | "matrixAvg" | "total";

const SellerRanking = ({ data }: { data: any[] }) => {
  const [sort, setSort] = useState<SortKey>("nps");
  const sellers = useMemo(() => {
    const list = computeSellerMetrics(data);
    return [...list].sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [data, sort]);

  if (!sellers.length) return null;

  const headers: { key: SortKey | null; label: string; align?: string }[] = [
    { key: null, label: "#" },
    { key: null, label: "Vendedor" },
    { key: "total", label: "Respostas", align: "text-right" },
    { key: "nps", label: "NPS", align: "text-right" },
    { key: "matrixAvg", label: "Média Matriz", align: "text-right" },
    { key: null, label: "Distribuição", align: "text-right" },
  ];

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: COLORS.accent }} />
          Ranking de Vendedores
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
                Ranking baseado em NPS, média da matriz e total de respostas. Clique nos cabeçalhos para ordenar.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[10px] uppercase tracking-wider" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
              {headers.map((h, i) => (
                <th key={i} className={`py-2 px-2 font-semibold ${h.align || "text-left"}`}>
                  {h.key ? (
                    <button
                      onClick={() => setSort(h.key as SortKey)}
                      className="inline-flex items-center gap-1 transition-colors"
                      style={{ color: sort === h.key ? COLORS.accent : undefined }}
                    >
                      {h.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  ) : h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sellers.map((s: SellerMetric, i) => {
              const totalNps = s.promoters + s.passives + s.detractors || 1;
              return (
                <tr
                  key={s.vendor}
                  className="border-b transition-colors"
                  style={{ borderColor: `${COLORS.border}4d` }}
                >
                  <td className="py-3 px-2 font-medium" style={{ color: COLORS.textMuted }}>{i + 1}</td>
                  <td className="py-3 px-2 font-semibold" style={{ color: COLORS.textMain }}>{s.vendor}</td>
                  <td className="py-3 px-2 text-right" style={{ color: COLORS.textMuted }}>{s.total}</td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold"
                      style={{ backgroundColor: npsBg(s.nps), color: npsColor(s.nps) }}
                    >
                      {s.nps}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-medium" style={{ color: COLORS.textMain }}>
                    {s.matrixAvg > 0 ? s.matrixAvg.toFixed(1) : "—"}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex h-2.5 rounded-full overflow-hidden ml-auto w-32" style={{ backgroundColor: `${COLORS.border}4d` }}>
                      <div
                        className="transition-all"
                        style={{ width: `${(s.detractors / totalNps) * 100}%`, backgroundColor: `${COLORS.error}cc` }}
                        title={`Detratores: ${s.detractors}`}
                      />
                      <div
                        className="transition-all"
                        style={{ width: `${(s.passives / totalNps) * 100}%`, backgroundColor: `${COLORS.warning}cc` }}
                        title={`Neutros: ${s.passives}`}
                      />
                      <div
                        className="transition-all"
                        style={{ width: `${(s.promoters / totalNps) * 100}%`, backgroundColor: `${COLORS.success}cc` }}
                        title={`Promotores: ${s.promoters}`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px]" style={{ color: COLORS.textMuted }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${COLORS.error}cc` }} />
            <span>Detratores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${COLORS.warning}cc` }} />
            <span>Neutros</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${COLORS.success}cc` }} />
            <span>Promotores</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerRanking;
