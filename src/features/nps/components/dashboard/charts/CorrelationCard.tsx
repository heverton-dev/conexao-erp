import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { COLORS } from "./chart-colors";

interface SurveyResponse {
  nps_score: number | null;
  matrix_facilidade_pedido: number;
  matrix_clareza_condicoes: number;
  matrix_prazo_entrega: number;
  matrix_disponibilidade_produtos: number;
  matrix_comunicacao: number;
}

const CRITERIA = [
  { key: "matrix_facilidade_pedido", label: "Facilidade de Pedido" },
  { key: "matrix_clareza_condicoes", label: "Clareza Comercial" },
  { key: "matrix_prazo_entrega", label: "Prazo de Entrega" },
  { key: "matrix_disponibilidade_produtos", label: "Disponibilidade" },
  { key: "matrix_comunicacao", label: "Comunicação" },
];

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

const CorrelationCard = ({ data }: { data: SurveyResponse[] }) => {
  const correlations = useMemo(() => {
    const valid = data.filter((r) => r.nps_score !== null);
    if (valid.length < 5) return [];
    const npsScores = valid.map((r) => r.nps_score!);
    return CRITERIA.map(({ key, label }) => {
      const criteriaScores = valid.map((r) => (r as any)[key] || 0);
      const corr = pearsonCorrelation(npsScores, criteriaScores);
      return { label, correlation: Number(corr.toFixed(2)) };
    }).sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [data]);

  if (!correlations.length) return null;

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-text-main text-base font-semibold">
          Impacto no NPS (Correlação)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs mb-4" style={{ color: COLORS.textMuted }}>
          Quanto maior o valor, mais esse critério influencia positivamente o NPS.
        </p>
        <div className="space-y-3">
          {correlations.map(({ label, correlation }) => {
            const absCorr = Math.abs(correlation);
            const isPositive = correlation >= 0;
            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-md"
                  style={{ backgroundColor: isPositive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: COLORS.success }} />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" style={{ color: COLORS.error }} />
                  )}
                </div>
                <span className="text-sm w-36 truncate" style={{ color: COLORS.textMain }}>{label}</span>
                <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ backgroundColor: "rgba(51,65,85,0.3)" }}>
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${absCorr * 100}%`,
                      background: isPositive
                        ? `linear-gradient(90deg, ${COLORS.success}99, ${COLORS.success}66)`
                        : `linear-gradient(90deg, ${COLORS.error}99, ${COLORS.error}66)`,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono font-semibold w-12 text-right"
                  style={{ color: isPositive ? COLORS.success : COLORS.error }}
                >
                  {correlation > 0 ? "+" : ""}{correlation}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationCard;
