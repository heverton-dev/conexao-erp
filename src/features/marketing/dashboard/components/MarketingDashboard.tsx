import { useState, useEffect } from "react";
import { EMPRESA_ID } from "~/config/empresa";
import { PageHeader } from "~/components/ui/page-header";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Target,
} from "lucide-react";
import { buscarMetricas, buscarEventosAgregados } from "../../lib/analytics";

export function MarketingDashboard() {
  const empresaId = EMPRESA_ID;
  const [metricas, setMetricas] = useState<
    { label: string; valor: number | string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }
    Promise.all([buscarMetricas(empresaId)])
      .then(([met]) => {
        setMetricas(
          met.map((m) => ({
            label: m.label,
            valor:
              typeof m.valor === "number"
                ? m.label.includes("Taxa")
                  ? `${m.valor}%`
                  : m.valor.toLocaleString("pt-BR")
                : m.valor,
          })),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [empresaId]);

  const icons = [
    BarChart3,
    Eye,
    MousePointerClick,
    Target,
    TrendingUp,
    TrendingUp,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard de Marketing"
        description="Metricas e insights de campanhas"
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : metricas.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="w-10 h-10 text-text-muted/30" />}
          title="Sem dados"
          description="Nenhum evento registrado nos ultimos 30 dias."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricas.map((m, i) => {
            const Icon = icons[i] || BarChart3;
            return (
              <Card
                key={m.label}
                className="p-5 space-y-2 transition-all hover:border-accent/30"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-accent" />
                  <span className="text-xs text-text-muted">{m.label}</span>
                </div>
                <p className="text-2xl font-bold text-text-main">{m.valor}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
