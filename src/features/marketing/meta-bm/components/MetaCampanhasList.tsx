import { useState } from "react";
import { Target, Search, Calendar, DollarSign, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { useMetaCampanhas } from "../hooks/useMetaBm";
import { EMPRESA_ID } from "~/config/empresa";
const STATUS_COLORS: Record<string, string> = {
  ativa: "bg-green-500/10 text-green-400 border-green-500/20",
  pausada: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  encerrada: "bg-surface text-text-muted border-border",
  rascunho: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function MetaCampanhasList() {
  const { profile } = useAuth();
  const empresaId = EMPRESA_ID ?? "";
  const { data: campanhas = [], isLoading } = useMetaCampanhas(empresaId);
  const [busca, setBusca] = useState("");

  const filtradas = campanhas.filter(
    (c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Campanhas Meta"
        description="Gerencie suas campanhas do Facebook e Instagram"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Buscar campanhas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {campanhas.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8 text-text-muted" />}
          title="Nenhuma campanha Meta"
          description="Conecte sua conta Meta Business Manager para sincronizar campanhas."
        />
      ) : (
        <div className="space-y-3">
          {filtradas.map((campanha) => (
            <Card key={campanha.id} className="hover:border-accent/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-text-main truncate">{campanha.nome}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[campanha.status] || "bg-surface text-text-muted border-border"}`}>
                        {campanha.status}
                      </span>
                      {campanha.plataforma && (
                        <span className="text-xs bg-surface border border-border rounded px-2 py-0.5 text-text-muted">
                          {campanha.plataforma}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                      {campanha.orcamento_diario && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} />
                          R$ {Number(campanha.orcamento_diario).toFixed(2)}/dia
                        </span>
                      )}
                      {campanha.orcamento_total && (
                        <span className="flex items-center gap-1">
                          <TrendingUp size={10} />
                          Total: R$ {Number(campanha.orcamento_total).toFixed(2)}
                        </span>
                      )}
                      {campanha.data_inicio && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(campanha.data_inicio).toLocaleDateString("pt-BR")}
                          {campanha.data_fim && ` → ${new Date(campanha.data_fim).toLocaleDateString("pt-BR")}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtradas.length === 0 && busca && (
            <EmptyState title="Nenhum resultado" description="Nenhuma campanha encontrada." />
          )}
        </div>
      )}
    </div>
  );
}
