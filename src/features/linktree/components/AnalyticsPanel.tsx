import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useAnalytics } from "../hooks/useEmpresaLinktree";
import type { AnalyticsPeriodo } from "../types-empresa";

const PERIODOS: { value: AnalyticsPeriodo; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
];

interface Props {
  empresaId?: string | null;
}

export function AnalyticsPanel({ empresaId }: Props) {
  const [periodo, setPeriodo] = useState<AnalyticsPeriodo>("30d");
  const { data: analytics = [], isLoading } = useAnalytics(periodo, empresaId);

  const maxCliques = Math.max(...analytics.map((a) => a.total_cliques), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <BarChart3 className="size-4" />
          Analytics
        </h3>
        <div className="flex gap-1">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`rounded px-2 py-1 text-xs transition ${
                periodo === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-hover text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Carregando...
        </p>
      ) : analytics.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum clique registrado.
        </p>
      ) : (
        <div className="space-y-3">
          {analytics.map((item) => (
            <div key={item.link_id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{item.link_titulo}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.total_cliques}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${(item.total_cliques / maxCliques) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
