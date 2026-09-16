import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { formatBRL } from "~/features/crm/lib/comercial";
import { cn } from "~/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

type Props = {
  periodo?: "semana" | "mes" | "trimestre";
};

const CORES_FUNIL = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#f97316",
  "#10b981",
  "#ef4444",
];

export function MetricasAvancadas({ periodo = "mes" }: Props) {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.is_super_admin === true;

  // Calcular datas do período
  const { dataInicio, dataFim } = useMemo(() => {
    const now = new Date();
    const inicio = new Date();
    switch (periodo) {
      case "semana":
        inicio.setDate(now.getDate() - 7);
        break;
      case "mes":
        inicio.setMonth(now.getMonth() - 1);
        break;
      case "trimestre":
        inicio.setMonth(now.getMonth() - 3);
        break;
    }
    return {
      dataInicio: inicio.toISOString().slice(0, 10),
      dataFim: now.toISOString().slice(0, 10),
    };
  }, [periodo]);

  // Buscar métricas gerais
  const { data: metricas, isLoading } = useQuery({
    queryKey: ["crm-metricas", profile?.id, dataInicio, dataFim],
    enabled: !!profile,
    queryFn: async () => {
      const userId = profile!.id;

      // Visitas no período
      const { data: visitas, count: totalVisitas } = await supabase
        .from("visitas")
        .select(
          "id, valor_estimado, gerou_pedido, gerou_orcamento, temperatura_vendedor, data_visita",
          { count: "exact" },
        )
        .eq("consultor_executor_id", userId)
        .gte("data_visita", dataInicio)
        .lte("data_visita", dataFim);

      // Clientes ativos
      const { count: totalClientes } = await supabase
        .from("clientes")
        .select("id", { count: "exact", head: true })
        .eq("consultor_atual_id", userId);

      // Tarefas pendentes
      const { count: tarefasPendentes } = await supabase
        .from("tarefas")
        .select("id", { count: "exact", head: true })
        .eq("responsavel_id", userId)
        .eq("status", "pendente");

      // Tarefas vencidas
      const { count: tarefasVencidas } = await supabase
        .from("tarefas")
        .select("id", { count: "exact", head: true })
        .eq("responsavel_id", userId)
        .eq("status", "pendente")
        .lt("data_vencimento", new Date().toISOString().slice(0, 10));

      // Cálculos de conversão
      const visitasComPedido =
        visitas?.filter((v) => v.gerou_pedido).length ?? 0;
      const visitasComOrcamento =
        visitas?.filter((v) => v.gerou_orcamento).length ?? 0;
      const valorTotal =
        visitas?.reduce((acc, v) => acc + (v.valor_estimado ?? 0), 0) ?? 0;
      const valorPedidos =
        visitas
          ?.filter((v) => v.gerou_pedido)
          .reduce((acc, v) => acc + (v.valor_estimado ?? 0), 0) ?? 0;

      // Distribuição por temperatura
      const porTemperatura = {
        Frio:
          visitas?.filter((v) => v.temperatura_vendedor === "Frio").length ?? 0,
        Morno:
          visitas?.filter((v) => v.temperatura_vendedor === "Morno").length ??
          0,
        Quente:
          visitas?.filter((v) => v.temperatura_vendedor === "Quente").length ??
          0,
      };

      // Visitas por dia (últimos 7 dias)
      const visitasPorDia = [];
      for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().slice(0, 10);
        const count =
          visitas?.filter((v) => v.data_visita === dataStr).length ?? 0;
        visitasPorDia.push({
          data: data.toLocaleDateString("pt-BR", { weekday: "short" }),
          visitas: count,
        });
      }

      return {
        totalVisitas: totalVisitas ?? 0,
        totalClientes: totalClientes ?? 0,
        tarefasPendentes: tarefasPendentes ?? 0,
        tarefasVencidas: tarefasVencidas ?? 0,
        visitasComPedido,
        visitasComOrcamento,
        valorTotal,
        valorPedidos,
        taxaConversao: totalVisitas
          ? (visitasComPedido / totalVisitas) * 100
          : 0,
        taxaOrcamento: totalVisitas
          ? (visitasComOrcamento / totalVisitas) * 100
          : 0,
        porTemperatura,
        visitasPorDia,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!metricas) return null;

  const kpis = [
    {
      label: "Visitas no Período",
      valor: metricas.totalVisitas,
      icone: Calendar,
      cor: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Clientes Ativos",
      valor: metricas.totalClientes,
      icone: Users,
      cor: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Taxa de Conversão",
      valor: `${metricas.taxaConversao.toFixed(1)}%`,
      icone: Target,
      cor: "text-green-500",
      bg: "bg-green-500/10",
      tendencia: metricas.taxaConversao > 20 ? "cima" : "baixo",
    },
    {
      label: "Valor em Pedidos",
      valor: formatBRL(metricas.valorPedidos),
      icone: DollarSign,
      cor: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Valor Total Negociado",
      valor: formatBRL(metricas.valorTotal),
      icone: TrendingUp,
      cor: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Taxa de Orçamento",
      valor: `${metricas.taxaOrcamento.toFixed(1)}%`,
      icone: BarChart3,
      cor: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Tarefas Pendentes",
      valor: metricas.tarefasPendentes,
      icone: Calendar,
      cor: "text-yellow-500",
      bg: "bg-yellow-500/10",
      alerta: metricas.tarefasVencidas > 0,
    },
    {
      label: "Tarefas Vencidas",
      valor: metricas.tarefasVencidas,
      icone: Calendar,
      cor: "text-destructive",
      bg: "bg-destructive/10",
      alerta: metricas.tarefasVencidas > 0,
    },
  ];

  const dadosTemperatura = [
    { nome: "Frio", valor: metricas.porTemperatura.Frio, cor: "#3b82f6" },
    { nome: "Morno", valor: metricas.porTemperatura.Morno, cor: "#f59e0b" },
    { nome: "Quente", valor: metricas.porTemperatura.Quente, cor: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icone;
          return (
            <div
              key={kpi.label}
              className={cn(
                "glass rounded-xl p-4",
                kpi.alerta && "border-destructive/50",
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", kpi.bg)}>
                  <Icon className={cn("h-4 w-4", kpi.cor)} />
                </div>
                {kpi.tendencia && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      kpi.tendencia === "cima"
                        ? "text-green-500"
                        : "text-destructive",
                    )}
                  >
                    {kpi.tendencia === "cima" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
              <p className="mt-3 text-2xl font-bold">{kpi.valor}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visitas por dia */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Visitas por Dia</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metricas.visitasPorDia}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="data" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="visitas"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por temperatura */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">
            Distribuição por Temperatura
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dadosTemperatura}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="valor"
                >
                  {dadosTemperatura.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {dadosTemperatura.map((item) => (
              <div key={item.nome} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.cor }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.nome}: {item.valor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
