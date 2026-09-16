import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, Sparkles } from "lucide-react";
import { COLORS } from "./chart-colors";

interface Props {
  data: any[];
}

const DynamicQuestionsChart = ({ data }: Props) => {
  const questions = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    data.forEach((r) => {
      const dyn = r.dynamic_answers;
      if (!dyn || typeof dyn !== "object") return;
      Object.entries(dyn).forEach(([q, v]) => {
        if (typeof v !== "string" || !v.trim()) return;
        if (v.length > 40) return;
        map[q] = map[q] || {};
        map[q][v] = (map[q][v] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([question, counts]) => ({
        question,
        total: Object.values(counts).reduce((a, b) => a + b, 0),
        items: Object.entries(counts).sort(([, a], [, b]) => b - a),
      }))
      .filter((q) => Object.keys(q.items).length > 0)
      .sort((a, b) => b.total - a.total);
  }, [data]);

  if (!questions.length) return null;

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
          Perguntas Dinâmicas
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
                Distribuição das respostas para cada pergunta dinâmica. Mostra somente respostas curtas (até 40 caracteres).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map(({ question, items, total }) => (
          <div key={question}>
            <p className="text-sm font-semibold mb-3" style={{ color: COLORS.textMain }}>
              {question}{" "}
              <span className="text-xs font-normal" style={{ color: COLORS.textMuted }}>
                ({total} respostas)
              </span>
            </p>
            <div className="space-y-2">
              {items.map(([answer, count]) => (
                <div key={answer} className="flex items-center gap-3">
                  <span className="text-xs w-40 truncate" style={{ color: COLORS.textMain }}>{answer}</span>
                  <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ backgroundColor: "rgba(51,65,85,0.3)" }}>
                    <div
                      className="h-full rounded-md transition-all"
                      style={{
                        width: `${(count / total) * 100}%`,
                        background: `linear-gradient(90deg, ${COLORS.accent}99, ${COLORS.accent}66)`,
                      }}
                    />
                  </div>
                  <span className="text-xs w-16 text-right font-medium" style={{ color: COLORS.textMuted }}>
                    {count} <span style={{ color: `${COLORS.textMuted}99` }}>({Math.round((count / total) * 100)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DynamicQuestionsChart;
