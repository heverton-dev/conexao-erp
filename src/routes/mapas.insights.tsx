import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth, useCan } from "~/lib/auth";
import {
  useMapasDistributors,
  useMapasConsultants,
} from "~/features/mapas/hooks/useMapasData";
import {
  Building2,
  Users,
  MapPin,
  BarChart3,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { ALL_UFS, UF_REGION } from "~/features/mapas/constants/brazil-states";
import type { Region } from "~/features/mapas/constants/brazil-states";
import { RequirePermission } from "~/components/guards";

export const mapasAdminInsightsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/mapas/insights",
  component: () => (
    <RequirePermission modulo="mapas-interativos" permissions={["mapas_ver_insights"]}>
      <MapasInsightsPage />
    </RequirePermission>
  ),
});

const REGIONS: Region[] = ["N", "NE", "CO", "SE", "S"];
const REGION_NAMES: Record<Region, string> = {
  N: "Norte",
  NE: "Nordeste",
  CO: "Centro-Oeste",
  SE: "Sudeste",
  S: "Sul",
};

function getRegionColor(region: Region): string {
  const colors: Record<Region, string> = {
    N: "#22c55e",
    NE: "#f59e0b",
    CO: "#a78bfa",
    SE: "#ef4444",
    S: "#3b82f6",
  };
  return colors[region];
}

function MapasInsightsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const canDist = useCan("mapas_gerir_distribuidores");
  const canCons = useCan("mapas_gerir_consultores");

  const distQ = useMapasDistributors();
  const consQ = useMapasConsultants();

  const loading = distQ.isLoading || consQ.isLoading;

  const distTotal = distQ.data?.length ?? 0;
  const consTotal = consQ.data?.length ?? 0;
  const distStates = new Set((distQ.data ?? []).map((d) => d.state)).size;
  const consStates = new Set((consQ.data ?? []).map((c) => c.state)).size;
  const total = distTotal + consTotal;
  const totalStates = new Set([
    ...(distQ.data ?? []).map((d) => d.state),
    ...(consQ.data ?? []).map((c) => c.state),
  ]).size;

  const regionStats = REGIONS.map((r) => {
    const ufs = ALL_UFS.filter((uf) => UF_REGION[uf] === r);
    const distCount = (distQ.data ?? []).filter(
      (d) => UF_REGION[d.state as keyof typeof UF_REGION] === r,
    ).length;
    const consCount = (consQ.data ?? []).filter(
      (c) => UF_REGION[c.state as keyof typeof UF_REGION] === r,
    ).length;
    return {
      region: r,
      name: REGION_NAMES[r],
      color: getRegionColor(r),
      total: distCount + consCount,
      covered: new Set([
        ...(distQ.data ?? [])
          .filter((d) => UF_REGION[d.state as keyof typeof UF_REGION] === r)
          .map((d) => d.state),
        ...(consQ.data ?? [])
          .filter((c) => UF_REGION[c.state as keyof typeof UF_REGION] === r)
          .map((c) => c.state),
      ]).size,
      totalUfs: ufs.length,
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Olá, {profile?.nome?.split(" ")[0] || "Usuário"}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Aqui está o resumo dos dados de presença comercial
          </p>
        </div>
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
          {/* Total Entidades */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 text-accent group-hover:scale-110 transition-transform duration-300">
              <Users size={22} />
            </div>
            <p className="text-xs font-semibold text-accent/80 uppercase tracking-wider">
              Total
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {total}
            </p>
            <p className="text-xs text-text-muted mt-2">
              Distribuidores + Consultores
            </p>
          </div>

          {/* Distribuidores */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Building2 size={22} />
            </div>
            <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider">
              Distribuidores
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {distTotal}
            </p>
            <p className="text-xs text-text-muted mt-2">
              {distStates} estados cobertos
            </p>
          </div>

          {/* Consultores */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border border-green-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/15 text-green-400 group-hover:scale-110 transition-transform duration-300">
              <Users size={22} />
            </div>
            <p className="text-xs font-semibold text-green-400/80 uppercase tracking-wider">
              Consultores
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {consTotal}
            </p>
            <p className="text-xs text-text-muted mt-2">
              {consStates} estados cobertos
            </p>
          </div>

          {/* Cobertura */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/15 text-yellow-400 group-hover:scale-110 transition-transform duration-300">
              <Globe size={22} />
            </div>
            <p className="text-xs font-semibold text-yellow-400/80 uppercase tracking-wider">
              Cobertura
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {totalStates}/{ALL_UFS.length}
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-yellow-500/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-1000"
                style={{ width: `${(totalStates / ALL_UFS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Presença por Região */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {regionStats.map((r) => (
            <div
              key={r.region}
              className="flex items-center gap-3 rounded-xl bg-surface border border-border p-3 transition-all duration-200 hover:scale-[1.02]"
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: `${r.color}15` }}
              >
                <MapPin size={16} style={{ color: r.color }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: r.color }}>
                  {r.total}
                </p>
                <p className="text-[11px] text-text-muted font-medium">
                  {r.name} ({r.covered}/{r.totalUfs})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acesso Rápido */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">Acesso Rápido</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {canDist && (
              <button
                onClick={() => navigate({ to: "/mapas/gestao/distribuidores" })}
                className="group flex items-center gap-4 rounded-xl bg-surface border border-border p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 font-bold text-sm shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-text-main truncate group-hover:text-accent transition-colors">
                    Gerenciar Distribuidores
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Adicionar, editar ou remover distribuidores
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-text-muted group-hover:text-accent transition-colors shrink-0"
                />
              </button>
            )}
            {canCons && (
              <button
                onClick={() => navigate({ to: "/mapas/gestao/consultores" })}
                className="group flex items-center gap-4 rounded-xl bg-surface border border-border p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 text-green-400 font-bold text-sm shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-text-main truncate group-hover:text-accent transition-colors">
                    Gerenciar Consultores
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Adicionar, editar ou remover consultores
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-text-muted group-hover:text-accent transition-colors shrink-0"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
