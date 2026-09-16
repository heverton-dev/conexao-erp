import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState, useEffect } from "react";
import {
  listarCadastros,
  STATUS_LABEL,
  STATUS_COLOR,
  type Cadastro,
} from "~/features/clientes";
import {
  getDocumentosStatusMap,
  type DocStatus,
} from "~/features/documentos";
import { useAuth } from "~/lib/auth";
import {
  CheckCircle,
  XCircle,
  Link2,
  Clock,
  AlertTriangle,
  Users,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { TutoriaisPopup } from "~/components/ui/tutoriais-popup";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import toast from "react-hot-toast";
import { RequirePermission } from "~/components/guards";
import {
  KPICard,
  KPI_PRESETS,
  StatusBreakdown,
  CadastroCard,
} from "~/features/cadastros/components";

export const dashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/dashboard",
  // redirectTo custom: o default do guard aponta para esta própria rota
  // (é o destino pós-login), o que causaria loop de redirecionamento.
  component: () => (
    <RequirePermission
      modulo="cadastros"
      permissions={["ver_todos_cadastros"]}
      redirectTo="/credenciais"
    >
      <DashboardPage />
    </RequirePermission>
  ),
});

function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<
    (Cadastro & { profiles: { nome: string } | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showTutoriais, setShowTutoriais] = useState(false);
  const [docsStatus, setDocsStatus] = useState<Record<string, DocStatus>>({});

  useEffect(() => {
    if (!profile) return;
    listarCadastros()
      .then(async (res) => {
        setData(res);
        const status = await getDocumentosStatusMap(
          res.map((c) => ({ id: c.id, tipo_pessoa: c.tipo_pessoa })),
        );
        setDocsStatus(status);
      })
      .catch(() => {
        toast.error("Erro ao carregar dados do dashboard");
      })
      .finally(() => setLoading(false));
  }, [profile]);

  const stats = {
    total: data.length,
    link_gerado: data.filter((c) => c.status === "link_gerado").length,
    dados_enviados: data.filter((c) => c.status === "dados_enviados").length,
    em_analise: data.filter((c) => c.status === "em_analise").length,
    em_correcao: data.filter((c) => c.status === "em_correcao").length,
    aprovados: data.filter((c) => c.status === "aprovado").length,
    reprovados: data.filter((c) => c.status === "reprovado").length,
  };

  const taxaAprovacao =
    stats.total > 0 ? Math.round((stats.aprovados / stats.total) * 100) : 0;
  const pendentes = stats.em_analise + stats.dados_enviados + stats.em_correcao;
  const recentes = data.slice(0, 9);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Olá, {profile?.nome?.split(" ")[0] || "Usuário"}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Aqui está o resumo das suas solicitações de cadastro
          </p>
        </div>
      </div>
      <TutoriaisPopup
        open={showTutoriais}
        onClose={() => setShowTutoriais(false)}
      />

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <KPICard
            icon={Users}
            label="Total"
            value={stats.total}
            subtitle="Clientes cadastrados"
            colorClass={KPI_PRESETS.total}
          />

          {/* Pendentes */}
          <KPICard
            icon={Clock}
            label="Pendentes"
            value={pendentes}
            subtitle="Aguardando ação"
            colorClass={KPI_PRESETS.pendentes}
          />

          {/* Aprovados */}
          <KPICard
            icon={CheckCircle}
            label="Aprovados"
            value={stats.aprovados}
            subtitle="Cadastros ativos"
            colorClass={KPI_PRESETS.aprovados}
          />

          {/* Taxa de Aprovação */}
          <KPICard
            icon={TrendingUp}
            label="Taxa Aprovação"
            value={`${taxaAprovacao}%`}
            subtitle="Taxa de aprovação"
            colorClass={KPI_PRESETS.taxa}
          />
        </div>
      )}

      {/* Status Breakdown */}
      {!loading && (
        <StatusBreakdown
          cols="6"
          items={[
            {
              label: "Links",
              value: stats.link_gerado,
              icon: Link2,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              label: "Enviados",
              value: stats.dados_enviados,
              icon: Clock,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
            },
            {
              label: "Análise",
              value: stats.em_analise,
              icon: AlertTriangle,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
              border: "border-yellow-500/20",
            },
            {
              label: "Correção",
              value: stats.em_correcao,
              icon: AlertTriangle,
              color: "text-orange-400",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
            },
            {
              label: "Aprovados",
              value: stats.aprovados,
              icon: CheckCircle,
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              label: "Reprovados",
              value: stats.reprovados,
              icon: XCircle,
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
            },
          ]}
        />
      )}

      {/* Solicitações Recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">
            Solicitações Recentes
          </h2>
          <Link
            to="/cadastros/solicitacoes"
            className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Ver todas <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : recentes.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-10 h-10 text-text-muted/30" />}
            title="Nenhuma solicitação recente"
            description="Quando novos cadastros forem criados, eles aparecerão aqui."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentes.map((c, i) => (
              <CadastroCard
                key={c.id}
                nome={c.lead_nome || c.nome_temporario || "Sem nome"}
                statusColor={STATUS_COLOR[c.status]}
                statusLabel={STATUS_LABEL[c.status]}
                tipoPessoa={c.tipo_pessoa ?? undefined}
                codigoCliente={c.codigo_cliente ?? undefined}
                createdAt={c.created_at}
                createdBy={c.profiles?.nome ?? undefined}
                onClick={() =>
                  navigate({
                    to: "/cadastros/solicitacoes/$id",
                    params: { id: c.id },
                  })
                }
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
