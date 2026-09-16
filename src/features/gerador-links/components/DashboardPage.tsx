import { useState } from "react";
import {
  BarChart3,
  Download,
  Link2,
  Monitor,
  MousePointerClick,
  Globe,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStats } from "../hooks/useDashboard";
import { useLinks } from "../hooks/useLinks";
import { TIPO_LINK_LABEL } from "../permissions";
import type { TipoLink } from "../types";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { downloadCSV } from "../utils/csv";
import { useEmpresaSuperAdmin } from "~/components/shared/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "~/components/shared/EmpresaSuperAdminSelector";

const CORES = [
  "var(--color-accent)",
  "var(--color-green)",
  "var(--color-blue)",
  "var(--color-orange)",
  "var(--color-pink)",
];

const LABEL_DEVICE: Record<string, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  tablet: "Tablet",
  unknown: "Desconhecido",
};

const LABEL_BROWSER: Record<string, string> = {
  chrome: "Chrome",
  safari: "Safari",
  firefox: "Firefox",
  edge: "Edge",
  opera: "Opera",
  samsung: "Samsung Internet",
  unknown: "Outro",
};

const LABEL_OS: Record<string, string> = {
  android: "Android",
  ios: "iOS",
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
  unknown: "Outro",
};

export function DashboardPage() {
  const [periodo, setPeriodo] = useState("30");
  const { empresaId, empresas, empresaSelecionada, setEmpresaSelecionada, isSuperAdmin } = useEmpresaSuperAdmin();

  const now = new Date();
  const dataFim = now.toISOString().slice(0, 10);
  const dataInicio = periodo === "all"
    ? undefined
    : new Date(now.getTime() - Number(periodo) * 86400000).toISOString().slice(0, 10);

  const { data: stats, isLoading } = useDashboardStats(dataInicio, dataFim);
  const { data: links } = useLinks();

  function handleExportCSV() {
    if (!stats?.top_links || stats.top_links.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    downloadCSV(
      `links-cliques-${dataFim}.csv`,
      ["Título", "Tipo", "Cliques"],
      stats.top_links.map((l) => [l.titulo, TIPO_LINK_LABEL[l.tipo] ?? l.tipo, String(l.total_cliques)]),
    );
    toast.success("CSV exportado!");
  }

  function handleExportCliquesDetalhado() {
    if (!stats?.referrer_groups) {
      toast.error("Nenhum clique registrado");
      return;
    }
    downloadCSV(
      `cliques-referrer-${dataFim}.csv`,
      ["Origem", "Cliques"],
      stats.referrer_groups.map((r) => [r.dominio, String(r.total)]),
    );
    toast.success("CSV exportado!");
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader title="Dashboard" description="Acompanhe seus links gerados" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total de Links",
      value: stats?.total_links ?? 0,
      icon: Link2,
      color: "text-accent",
    },
    {
      label: "Total de Cliques",
      value: stats?.total_cliques ?? 0,
      icon: MousePointerClick,
      color: "text-green",
    },
    {
      label: "Links Mais Clicado",
      value: stats?.top_links?.[0]?.titulo ?? "—",
      icon: TrendingUp,
      color: "text-blue",
    },
    {
      label: "Links Gerados",
      value: links?.length ?? 0,
      icon: BarChart3,
      color: "text-orange",
    },
  ];

  const pieData = (stats?.links_por_tipo ?? []).filter((d) => d.total > 0);

  const deviceData = Object.entries(stats?.dispositivos ?? {}).map(([k, v]) => ({
    name: LABEL_DEVICE[k] ?? k,
    value: v,
  }));

  const browserData = Object.entries(stats?.navegadores ?? {}).map(([k, v]) => ({
    name: LABEL_BROWSER[k] ?? k,
    value: v,
  }));

  const osData = Object.entries(stats?.sistemas ?? {}).map(([k, v]) => ({
    name: LABEL_OS[k] ?? k,
    value: v,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Acompanhe o desempenho dos links gerados"
        actions={
          <div className="flex items-center gap-2">
            {isSuperAdmin && empresas.length > 0 && (
              <EmpresaSuperAdminSelector
                empresas={empresas}
                value={empresaSelecionada}
                onChange={setEmpresaSelecionada}
              />
            )}
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="all">Todo período</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4" /> Exportar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">
                {card.label}
              </CardTitle>
              <card.icon size={18} className={card.color} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cliques por Tipo de Link</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">Nenhum clique registrado ainda</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="tipo" cx="50%" cy="50%" outerRadius={90}
                    label={({ payload, percent }) => {
                      const tipo = (payload as { tipo: TipoLink }).tipo;
                      return `${TIPO_LINK_LABEL[tipo] ?? tipo} (${((percent ?? 0) * 100).toFixed(0)}%)`;
                    }}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliques nos Últimos Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.cliques_por_dia ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">Nenhum clique registrado ainda</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats?.cliques_por_dia ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" tickFormatter={(v) => v?.slice(5) ?? ""} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                  <Tooltip />
                  <Bar dataKey="total" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {stats && Object.keys(stats.dispositivos).length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dispositivos</CardTitle>
              <Smartphone size={16} className="text-text-muted" />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {deviceData.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {stats && Object.keys(stats.navegadores).length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Navegadores</CardTitle>
              <Monitor size={16} className="text-text-muted" />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {browserData.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stats && stats.referrer_groups.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Origem dos Cliques</CardTitle>
              <Globe size={16} className="text-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[260px] overflow-y-auto">
                {stats.referrer_groups.slice(0, 15).map((r) => {
                  const maxTotal = stats.referrer_groups[0].total;
                  const pct = (r.total / (stats.total_cliques || 1)) * 100;
                  return (
                    <div key={r.dominio} className="flex items-center gap-3">
                      <span className="w-28 truncate text-sm text-text-main">{r.dominio}</span>
                      <div className="flex-1 h-5 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${(r.total / maxTotal) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs text-text-muted">
                        {r.total} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={handleExportCliquesDetalhado}>
                  <Download className="w-4 h-4" /> Exportar origens
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {stats && Object.keys(stats.sistemas).length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sistemas Operacionais</CardTitle>
              <Monitor size={16} className="text-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {osData.sort((a, b) => b.value - a.value).map((item) => {
                  const maxValue = osData[0]?.value ?? 1;
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-24 truncate text-sm text-text-main">{item.name}</span>
                      <div className="flex-1 h-5 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${(item.value / maxValue) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-text-muted">{item.value} cliques</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Links Mais Clicados</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(stats?.top_links ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">Nenhum link salvo ou clicado ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-hover/30">
                  <tr className="border-b border-border">
                    <th className="h-11 px-4 text-left font-semibold text-text-secondary">Título</th>
                    <th className="h-11 px-4 text-left font-semibold text-text-secondary">Tipo</th>
                    <th className="h-11 px-4 text-right font-semibold text-text-secondary">Cliques</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.top_links.map((link) => (
                    <tr key={link.id} className="border-b border-border/50 hover:bg-surface-hover/20 transition-colors">
                      <td className="px-4 py-3">{link.titulo}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {TIPO_LINK_LABEL[link.tipo] ?? link.tipo}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{link.total_cliques}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
