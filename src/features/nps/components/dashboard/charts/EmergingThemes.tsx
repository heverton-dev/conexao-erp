import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { HelpCircle, Tags } from "lucide-react";
import { THEMES, classifyThemes } from "~/lib/themes";
import { extractAllText } from "~/lib/sentiment";
import { COLORS } from "./chart-colors";

const EmergingThemes = ({ data }: { data: any[] }) => {
  const themes = useMemo(() => {
    const counts: Record<string, number> = {};
    THEMES.forEach((t) => (counts[t.id] = 0));
    let totalWithComment = 0;
    data.forEach((r) => {
      const text = extractAllText(r);
      if (!text.trim()) return;
      totalWithComment++;
      classifyThemes(text).forEach((id) => counts[id]++);
    });
    const max = Math.max(1, ...Object.values(counts));
    return {
      rows: THEMES.map((t) => ({
        ...t,
        count: counts[t.id],
        pct: totalWithComment ? Math.round((counts[t.id] / totalWithComment) * 100) : 0,
      })).sort((a, b) => b.count - a.count),
      max,
      totalWithComment,
    };
  }, [data]);

  if (!themes.totalWithComment) return null;

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <Tags className="w-4 h-4" style={{ color: COLORS.accent }} />
          Temas Emergentes
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
                Cada comentário é classificado nos temas com base em palavras-chave.
                % é calculado sobre o total de comentários do recorte ({themes.totalWithComment}).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {themes.rows.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <span className="text-sm w-44 truncate" style={{ color: COLORS.textMain }}>{t.label}</span>
            <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ backgroundColor: "rgba(51,65,85,0.3)" }}>
              <div
                className="h-full rounded-md transition-all"
                style={{
                  width: `${(t.count / themes.max) * 100}%`,
                  background: `linear-gradient(90deg, ${COLORS.accent}99, ${COLORS.accent}66)`,
                }}
              />
            </div>
            <span className="text-xs w-20 text-right font-medium" style={{ color: COLORS.textMuted }}>
              {t.count} <span style={{ color: `${COLORS.textMuted}99` }}>({t.pct}%)</span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EmergingThemes;
