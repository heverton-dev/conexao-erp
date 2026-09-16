import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { useAuth, useCan } from "~/lib/auth";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  type CadastroStatus,
} from "~/features/clientes";
import {
  getDocumentosStatusMap,
  DOC_STATUS_LABEL,
  DOC_STATUS_COLOR,
  type DocStatus,
} from "~/features/documentos";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Link2,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  KPICard,
  KPI_PRESETS,
  StatusBreakdown,
  CadastroCard,
  usePagination,
} from "~/features/cadastros/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import toast from "react-hot-toast";
import { RequirePermission } from "~/components/guards";

export const relatoriosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/relatorios",
  component: () => (
    <RequirePermission modulo="cadastros" permissions={["ver_relatorios"]}>
      <RelatoriosPage />
    </RequirePermission>
  ),
});

function RelatoriosPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const verTodos = useCan("ver_todos_cadastros");
  const [periodo, setPeriodo] = useState("30");
  const [filtroStatus, setFiltroStatus] = useState<CadastroStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [docsStatus, setDocsStatus] = useState<Record<string, DocStatus>>({});

  useEffect(() => {
    carregar();
  }, [periodo]);

  async function carregar() {
    setLoading(true);
    try {
      const diasAtras = new Date();
      diasAtras.setDate(diasAtras.getDate() - Number(periodo));
      let query = supabase
        .from("cadastros")
        .select("*")
        .gte("created_at", diasAtras.toISOString());
      if (!verTodos && user?.id) {
        query = query.eq("created_by", user.id);
      }
      const { data: cadastros } = await query.order("created_at", {
        ascending: false,
      });
      setData(cadastros || []);
      const items = cadastros || [];
      if (items.length > 0) {
        const status = await getDocumentosStatusMap(
          items.map((c: any) => ({ id: c.id, tipo_pessoa: c.tipo_pessoa })),
        );
        setDocsStatus(status);
      }
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  const filtered = filtroStatus
    ? data.filter((c) => c.status === filtroStatus)
    : data;

  const stats = {
    total: filtered.length,
    link_gerado: filtered.filter((c) => c.status === "link_gerado").length,
    dados_enviados: filtered.filter((c) => c.status === "dados_enviados")
      .length,
    em_analise: filtered.filter((c) => c.status === "em_analise").length,
    em_correcao: filtered.filter((c) => c.status === "em_correcao").length,
    aprovados: filtered.filter((c) => c.status === "aprovado").length,
    reprovados: filtered.filter((c) => c.status === "reprovado").length,
  };

  const taxaAprovacao =
    stats.total > 0 ? Math.round((stats.aprovados / stats.total) * 100) : 0;
  const pendentes = stats.em_analise + stats.dados_enviados + stats.em_correcao;

  const { paginatedItems, currentPage, totalPages, canPrev, canNext, goTo } =
    usePagination(filtered, 12);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Relatórios
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Filtre e exporte dados do sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtroStatus}
          onValueChange={(v) => setFiltroStatus(v as CadastroStatus | "")}
        >
          <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            <SelectItem value="link_gerado">Link Gerado</SelectItem>
            <SelectItem value="dados_enviados">Dados Enviados</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="em_correcao">Em Correção</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="reprovado">Reprovado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Users}
            label="Total"
            value={stats.total}
            subtitle="Cadastros no período"
            colorClass={KPI_PRESETS.total}
          />
          <KPICard
            icon={Clock}
            label="Pendentes"
            value={pendentes}
            subtitle="Aguardando ação"
            colorClass={KPI_PRESETS.pendentes}
          />
          <KPICard
            icon={CheckCircle}
            label="Aprovados"
            value={stats.aprovados}
            subtitle="Cadastros ativos"
            colorClass={KPI_PRESETS.aprovados}
          />
          <KPICard
            icon={TrendingUp}
            label="Taxa Aprovação"
            value={`${taxaAprovacao}%`}
            subtitle="Aprovados / Total"
            colorClass={KPI_PRESETS.taxa}
          />
          {/* Progress bar for Taxa de Aprovação */}
          <div className="col-span-2 lg:col-span-4 -mt-2">
            <div className="h-1.5 w-full rounded-full bg-blue-500/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
                style={{ width: `${taxaAprovacao}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {!loading && (
        <StatusBreakdown
          items={[
            {
              label: "Links",
              value: stats.link_gerado,
              icon: Link2,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
              filter: "link_gerado",
            },
            {
              label: "Enviados",
              value: stats.dados_enviados,
              icon: Clock,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
              filter: "dados_enviados",
            },
            {
              label: "Análise",
              value: stats.em_analise,
              icon: AlertTriangle,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
              border: "border-yellow-500/20",
              filter: "em_analise",
            },
            {
              label: "Correção",
              value: stats.em_correcao,
              icon: AlertTriangle,
              color: "text-orange-400",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
              filter: "em_correcao",
            },
            {
              label: "Aprovados",
              value: stats.aprovados,
              icon: CheckCircle,
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
              filter: "aprovado",
            },
            {
              label: "Reprovados",
              value: stats.reprovados,
              icon: XCircle,
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
              filter: "reprovado",
            },
          ]}
          activeFilter={filtroStatus}
          onSelect={(f) => setFiltroStatus((f as CadastroStatus | "") ?? "")}
          cols="6"
        />
      )}

      {/* Cadastros Recentes */}
      {!loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-main">
              Cadastros Recentes
            </h2>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="w-10 h-10 text-text-muted/30" />}
              title="Nenhum cadastro encontrado"
              description="Ajuste os filtros ou aguarde novos cadastros."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginatedItems.map((c: any, i: number) => {
                  const docStatus = docsStatus[c.id];
                  return (
                    <CadastroCard
                      key={c.id}
                      nome={c.lead_nome || c.nome_temporario || "Sem nome"}
                      statusColor={STATUS_COLOR[c.status as CadastroStatus]}
                      statusLabel={STATUS_LABEL[c.status as CadastroStatus]}
                      docStatusColor={
                        docStatus
                          ? DOC_STATUS_COLOR[docStatus]
                          : undefined
                      }
                      docStatusLabel={docStatus ? DOC_STATUS_LABEL[docStatus] : undefined}
                      tipoPessoa={c.tipo_pessoa}
                      codigoCliente={c.codigo_cliente}
                      createdAt={c.created_at}
                      onClick={() =>
                        navigate({
                          to: "/cadastros/solicitacoes/$id",
                          params: { id: c.id },
                        })
                      }
                      index={i}
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => canPrev && goTo(currentPage - 1)}
                          aria-disabled={!canPrev}
                          className={!canPrev ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <PaginationItem key={idx}>
                          <PaginationLink
                            isActive={currentPage === idx + 1}
                            onClick={() => goTo(idx + 1)}
                          >
                            {idx + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => canNext && goTo(currentPage + 1)}
                          aria-disabled={!canNext}
                          className={!canNext ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
