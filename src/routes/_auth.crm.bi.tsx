import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { formatBRL, type Temperatura } from "~/features/crm/lib/comercial";
import {
  TrendingUp,
  Snowflake,
  Flame,
  Sun,
  Filter,
  X,
  ChevronRight,
  User,
  Phone,
  Calendar,
  Briefcase,
  Target,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  Clock,
  Stethoscope,
  Building2,
  Activity,
  ClipboardList,
} from "lucide-react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RequirePermission } from "~/components/guards";

type BiSearch = {
  vendedor?: string;
  inicio?: string;
  fim?: string;
};

export const crmBiRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/bi",
  validateSearch: (s: Record<string, unknown>): BiSearch => ({
    vendedor: typeof s.vendedor === "string" ? s.vendedor : undefined,
    inicio: typeof s.inicio === "string" ? s.inicio : undefined,
    fim: typeof s.fim === "string" ? s.fim : undefined,
  }),
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_bi"]}>
      <BIPage />
    </RequirePermission>
  ),
});

const TEMPS: {
  key: Temperatura;
  label: string;
  icon: typeof Sun;
  color: string;
}[] = [
  {
    key: "Frio",
    label: "Frio",
    icon: Snowflake,
    color: "text-[var(--color-frio)]",
  },
  {
    key: "Morno",
    label: "Morno",
    icon: Sun,
    color: "text-[var(--color-morno)]",
  },
  {
    key: "Quente",
    label: "Quente",
    icon: Flame,
    color: "text-[var(--color-quente)]",
  },
];

const TIPOS = ["Prospecção", "Relacionamento", "Pós-venda"] as const;
const PROBS = ["Baixa", "Média", "Alta"] as const;
const TRISTATE = [
  { v: "all", l: "Todos" },
  { v: "true", l: "Sim" },
  { v: "false", l: "Não" },
] as const;

type Filters = {
  gestor: string; // user id or "all"
  vendedor: string; // user id or "all"
  dataInicio: string;
  dataFim: string;
  tipo: string; // tipo_visita or "all"
  pedido: "all" | "true" | "false";
  orcamento: "all" | "true" | "false";
  temperatura: string;
  probabilidade: string;
};

const EMPTY: Filters = {
  gestor: "all",
  vendedor: "all",
  dataInicio: "",
  dataFim: "",
  tipo: "all",
  pedido: "all",
  orcamento: "all",
  temperatura: "all",
  probabilidade: "all",
};

function BIPage() {
  const search = crmBiRoute.useSearch();
  const { user, profile } = useAuth();
  const isDev = profile?.is_super_admin === true;
  const { data: usuarioAtual } = useQuery({
    queryKey: ["usuario-atual-crm", user?.id],
    enabled: !!user?.id && !isDev,
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const isDiretor = usuarioAtual?.role === "diretor_comercial";
  const showGestorFilter = isDiretor || isDev;
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY,
    vendedor: search.vendedor ?? "all",
    dataInicio: search.inicio ?? "",
    dataFim: search.fim ?? "",
  });

  // React if the user lands on /bi with new search params
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      vendedor: search.vendedor ?? "all",
      dataInicio: search.inicio ?? f.dataInicio,
      dataFim: search.fim ?? f.dataFim,
    }));
  }, [search.vendedor, search.inicio, search.fim]);

  const { data: vendedores } = useQuery({
    queryKey: ["bi-vendedores"],
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome_completo, role, gestor_id")
        .eq("role", "consultor")
        .order("nome_completo");
      return data ?? [];
    },
  });

  const { data: gestores } = useQuery({
    queryKey: ["bi-gestores"],
    enabled: showGestorFilter,
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome_completo")
        .eq("role", "gestor")
        .order("nome_completo");
      return data ?? [];
    },
  });

  // Vendedores visíveis na lista (filtrados pelo gestor, se selecionado)
  const vendedoresFiltrados = useMemo(() => {
    const list = vendedores ?? [];
    if (filters.gestor === "all") return list;
    return list.filter((u: any) => u.gestor_id === filters.gestor);
  }, [vendedores, filters.gestor]);

  // IDs dos consultores aplicáveis quando filtro de gestor está ativo
  const consultorIdsDoGestor = useMemo(() => {
    if (filters.gestor === "all") return null;
    return (vendedores ?? [])
      .filter((u: any) => u.gestor_id === filters.gestor)
      .map((u: any) => u.id);
  }, [vendedores, filters.gestor]);

  // Se trocar gestor e o vendedor selecionado não pertence mais a ele, limpa
  useEffect(() => {
    if (filters.vendedor === "all") return;
    if (
      consultorIdsDoGestor &&
      !consultorIdsDoGestor.includes(filters.vendedor)
    ) {
      setFilters((f) => ({ ...f, vendedor: "all" }));
    }
  }, [consultorIdsDoGestor, filters.vendedor]);

  const { data, isLoading } = useQuery({
    queryKey: ["bi", filters, consultorIdsDoGestor],
    queryFn: async () => {
      let q = supabase
        .from("visitas")
        .select(
          "temperatura_vendedor, valor_estimado, gerou_pedido, gerou_orcamento, tipo_visita, probabilidade_fechamento, data_visita, consultor_executor_id",
        );
      if (filters.vendedor !== "all") {
        q = q.eq("consultor_executor_id", filters.vendedor);
      } else if (consultorIdsDoGestor) {
        q = q.in(
          "consultor_executor_id",
          consultorIdsDoGestor.length
            ? consultorIdsDoGestor
            : ["00000000-0000-0000-0000-000000000000"],
        );
      }
      if (filters.dataInicio) q = q.gte("data_visita", filters.dataInicio);
      if (filters.dataFim) q = q.lte("data_visita", filters.dataFim);
      if (filters.tipo !== "all") q = q.eq("tipo_visita", filters.tipo as any);
      if (filters.pedido !== "all")
        q = q.eq("gerou_pedido", filters.pedido === "true");
      if (filters.orcamento !== "all")
        q = q.eq("gerou_orcamento", filters.orcamento === "true");
      if (filters.temperatura !== "all")
        q = q.eq("temperatura_vendedor", filters.temperatura as any);
      if (filters.probabilidade !== "all")
        q = q.eq("probabilidade_fechamento", filters.probabilidade as any);

      const { data: visitas } = await q;
      const v = visitas ?? [];
      const total = v.length;
      const pipeline = v.reduce(
        (s, x: any) => s + (Number(x.valor_estimado) || 0),
        0,
      );
      const fechado = v
        .filter((x: any) => x.gerou_pedido)
        .reduce((s, x: any) => s + (Number(x.valor_estimado) || 0), 0);
      const conv = total
        ? Math.round(
            (v.filter((x: any) => x.gerou_pedido).length / total) * 100,
          )
        : 0;
      const porTemp = TEMPS.map((t) => ({
        ...t,
        count: v.filter((x: any) => x.temperatura_vendedor === t.key).length,
        valor: v
          .filter((x: any) => x.temperatura_vendedor === t.key)
          .reduce((s, x: any) => s + (Number(x.valor_estimado) || 0), 0),
      }));
      const funil = TIPOS.map((tp) => ({
        tipo: tp,
        count: v.filter((x: any) => x.tipo_visita === tp).length,
      }));
      return { total, pipeline, fechado, conv, porTemp, funil };
    },
  });

  const { data: visitasList } = useQuery({
    queryKey: ["bi-visitas-list", filters, consultorIdsDoGestor],
    queryFn: async () => {
      let q = supabase
        .from("visitas")
        .select(
          `id, data_visita, tipo_visita, temperatura_vendedor, probabilidade_fechamento,
           valor_estimado, gerou_pedido, gerou_orcamento, atendente, cargo_atendente,
           interesse_escala, acao_prevista, data_proximo_contato,
           feedback_cliente, observacoes_vendedor, criado_em, cliente_id, consultor_executor_id,
           cliente:clientes(id, nome_clinica, nome_doutor, telefone_contato),
           consultor:usuarios!visitas_consultor_executor_id_fkey(id, nome_completo)`,
        )
        .order("data_visita", { ascending: false })
        .limit(200);
      if (filters.vendedor !== "all") {
        q = q.eq("consultor_executor_id", filters.vendedor);
      } else if (consultorIdsDoGestor) {
        q = q.in(
          "consultor_executor_id",
          consultorIdsDoGestor.length
            ? consultorIdsDoGestor
            : ["00000000-0000-0000-0000-000000000000"],
        );
      }
      if (filters.dataInicio) q = q.gte("data_visita", filters.dataInicio);
      if (filters.dataFim) q = q.lte("data_visita", filters.dataFim);
      if (filters.tipo !== "all") q = q.eq("tipo_visita", filters.tipo as any);
      if (filters.pedido !== "all")
        q = q.eq("gerou_pedido", filters.pedido === "true");
      if (filters.orcamento !== "all")
        q = q.eq("gerou_orcamento", filters.orcamento === "true");
      if (filters.temperatura !== "all")
        q = q.eq("temperatura_vendedor", filters.temperatura as any);
      if (filters.probabilidade !== "all")
        q = q.eq("probabilidade_fechamento", filters.probabilidade as any);
      const { data } = await q;
      // Fallback: if join failed (no FK), enrich manually
      const rows: any[] = data ?? [];
      const needCliente = rows.some((r) => !r.cliente);
      const needConsultor = rows.some((r) => !r.consultor);
      if (needCliente || needConsultor) {
        const cIds = Array.from(
          new Set(rows.map((r) => r.cliente_id).filter(Boolean)),
        );
        const uIds = Array.from(
          new Set(rows.map((r) => r.consultor_executor_id).filter(Boolean)),
        );
        const [{ data: cs }, { data: us }] = await Promise.all([
          cIds.length
            ? supabase
                .from("clientes")
                .select("id, nome_clinica, nome_doutor, telefone_contato")
                .in("id", cIds)
            : Promise.resolve({ data: [] as any[] }),
          uIds.length
            ? supabase
                .from("usuarios")
                .select("id, nome_completo")
                .in("id", uIds)
            : Promise.resolve({ data: [] as any[] }),
        ]);
        const cMap = new Map((cs ?? []).map((x: any) => [x.id, x]));
        const uMap = new Map((us ?? []).map((x: any) => [x.id, x]));
        rows.forEach((r) => {
          if (!r.cliente) r.cliente = cMap.get(r.cliente_id) ?? null;
          if (!r.consultor)
            r.consultor = uMap.get(r.consultor_executor_id) ?? null;
        });
      }
      return rows;
    },
  });

  const [openVisita, setOpenVisita] = useState<any | null>(null);

  const activeCount = useMemo(
    () =>
      (Object.keys(EMPTY) as (keyof Filters)[]).filter(
        (k) => filters[k] !== EMPTY[k],
      ).length,
    [filters],
  );

  function set<K extends keyof Filters>(k: K, v: Filters[K]) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inteligência Comercial</h1>
          <p className="text-sm text-muted-foreground">
            {filters.vendedor !== "all"
              ? `Visão individual: ${
                  (vendedores ?? []).find((u: any) => u.id === filters.vendedor)
                    ?.nome_completo ?? "consultor"
                }`
              : "Visão consolidada do funil, pipeline e performance."}
          </p>
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY)}>
            <X className="mr-1 h-4 w-4" /> Limpar filtros ({activeCount})
          </Button>
        )}
      </header>

      {/* Filters */}
      <section className="glass rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <Filter className="h-3.5 w-3.5 text-gold" /> Filtros
        </div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {showGestorFilter && (
            <FilterField label="Gestor">
              <Select
                value={filters.gestor}
                onValueChange={(v) => set("gestor", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(gestores ?? []).map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
          )}

          <FilterField label="Vendedor">
            <Select
              value={filters.vendedor}
              onValueChange={(v) => set("vendedor", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {vendedoresFiltrados.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Data inicial">
            <Input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </FilterField>
          <FilterField label="Data final">
            <Input
              type="date"
              value={filters.dataFim}
              onChange={(e) => set("dataFim", e.target.value)}
            />
          </FilterField>

          <FilterField label="Tipo de visita">
            <Select value={filters.tipo} onValueChange={(v) => set("tipo", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Gerou pedido?">
            <Select
              value={filters.pedido}
              onValueChange={(v) => set("pedido", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRISTATE.map((o) => (
                  <SelectItem key={o.v} value={o.v}>
                    {o.l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Gerou orçamento?">
            <Select
              value={filters.orcamento}
              onValueChange={(v) => set("orcamento", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRISTATE.map((o) => (
                  <SelectItem key={o.v} value={o.v}>
                    {o.l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Temperatura">
            <Select
              value={filters.temperatura}
              onValueChange={(v) => set("temperatura", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {TEMPS.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Probabilidade">
            <Select
              value={filters.probabilidade}
              onValueChange={(v) => set("probabilidade", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {PROBS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Kpi label="Visitas" value={isLoading ? "…" : (data?.total ?? "—")} />
        <Kpi label="Pipeline" value={formatBRL(data?.pipeline ?? 0)} accent />
        <Kpi label="Fechado" value={formatBRL(data?.fechado ?? 0)} />
        <Kpi
          label="Conversão"
          value={`${data?.conv ?? 0}%`}
          icon={TrendingUp}
        />
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Funil por tipo de visita
        </h2>
        <div className="glass rounded-2xl p-5 space-y-3">
          {(data?.funil ?? []).map((f) => {
            const max = Math.max(...(data?.funil ?? []).map((x) => x.count), 1);
            const pct = (f.count / max) * 100;
            return (
              <div key={f.tipo}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{f.tipo}</span>
                  <span className="text-gold font-semibold">{f.count}</span>
                </div>
                <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-blue"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Distribuição por temperatura
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {(data?.porTemp ?? []).map((t) => {
            const Icon = t.icon;
            const max = Math.max(
              ...(data?.porTemp ?? []).map((x) => x.count),
              1,
            );
            const pct = (t.count / max) * 100;
            return (
              <div key={t.key} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${t.color}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-semibold uppercase">
                      {t.label}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{t.count}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: "var(--gradient-gold)",
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatBRL(t.valor)} em pipeline
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Pipeline de visitas ({visitasList?.length ?? 0})
        </h2>
        {(() => {
          const cols = [
            {
              key: "Frio" as const,
              label: "Frio",
              icon: Snowflake,
              accent: "text-sky-300",
              bg: "bg-sky-500/10",
              ring: "ring-sky-500/30",
              dot: "bg-sky-400",
            },
            {
              key: "Morno" as const,
              label: "Morno",
              icon: Sun,
              accent: "text-amber-300",
              bg: "bg-amber-400/10",
              ring: "ring-amber-400/30",
              dot: "bg-amber-400",
            },
            {
              key: "Quente" as const,
              label: "Quente",
              icon: Flame,
              accent: "text-orange-400",
              bg: "bg-orange-500/10",
              ring: "ring-orange-500/30",
              dot: "bg-orange-500",
            },
          ];
          const list = visitasList ?? [];
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cols.map((c) => {
                const items = list.filter(
                  (v: any) => v.temperatura_vendedor === c.key,
                );
                const Icon = c.icon;
                return (
                  <div
                    key={c.key}
                    className={`glass rounded-2xl p-3 ring-1 ${c.ring} flex flex-col`}
                  >
                    <div
                      className={`flex items-center justify-between rounded-xl ${c.bg} px-3 py-2 mb-3`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${c.accent}`} />
                        <span className={`text-sm font-semibold ${c.accent}`}>
                          {c.label}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold rounded-full px-2 py-0.5 bg-background/40 ${c.accent}`}
                      >
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-2 min-h-[100px]">
                      {items.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setOpenVisita(v)}
                          className="group w-full text-left rounded-xl border border-border/50 bg-background/40 hover:bg-background/70 hover:border-border transition p-3 space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${c.dot}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate group-hover:text-gold transition">
                                {v.cliente?.nome_clinica ??
                                  v.cliente?.nome_doutor ??
                                  "Cliente"}
                              </p>
                              {v.cliente?.nome_clinica &&
                                v.cliente?.nome_doutor && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {v.cliente.nome_doutor}
                                  </p>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {new Date(v.data_visita).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                            <span className="truncate ml-2">
                              {v.tipo_visita}
                            </span>
                          </div>
                          {(v.gerou_pedido ||
                            v.gerou_orcamento ||
                            v.valor_estimado != null) && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
                              {v.gerou_pedido && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                                  Pedido
                                </span>
                              )}
                              {v.gerou_orcamento && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30">
                                  Orçamento
                                </span>
                              )}
                              {v.valor_estimado != null && (
                                <span className="ml-auto text-xs font-semibold gradient-text-gold">
                                  {formatBRL(Number(v.valor_estimado))}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground/70 truncate">
                            {v.consultor?.nome_completo ?? "—"}
                          </p>
                        </button>
                      ))}
                      {!items.length && (
                        <div className="rounded-xl border border-dashed border-border/40 p-4 text-center text-xs text-muted-foreground">
                          Sem visitas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      <Dialog
        open={!!openVisita}
        onOpenChange={(o) => !o && setOpenVisita(null)}
      >
        <DialogContent className="max-w-3xl">
          {openVisita &&
            (() => {
              const temp = openVisita.temperatura_vendedor as
                Temperatura | undefined;
              const tempCfg =
                temp === "Quente"
                  ? {
                      icon: Flame,
                      label: "Quente",
                      grad: "from-orange-500/20 via-red-500/15 to-transparent",
                      ring: "ring-orange-500/40",
                      text: "text-orange-400",
                      bg: "bg-orange-500/15",
                    }
                  : temp === "Morno"
                    ? {
                        icon: Sun,
                        label: "Morno",
                        grad: "from-amber-400/20 via-yellow-500/15 to-transparent",
                        ring: "ring-amber-400/40",
                        text: "text-amber-300",
                        bg: "bg-amber-400/15",
                      }
                    : {
                        icon: Snowflake,
                        label: "Frio",
                        grad: "from-sky-400/20 via-blue-500/15 to-transparent",
                        ring: "ring-sky-400/40",
                        text: "text-sky-300",
                        bg: "bg-sky-400/15",
                      };
              const TempIcon = tempCfg.icon;
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${tempCfg.bg} text-accent`}
                      >
                        <TempIcon className={`h-6 w-6 ${tempCfg.text}`} />
                      </div>
                      <div>
                        <DialogTitle>
                          {openVisita.cliente?.nome_clinica ??
                            "Detalhes da visita"}
                        </DialogTitle>
                        <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          {openVisita.cliente?.nome_doutor && (
                            <span className="inline-flex items-center gap-1.5">
                              <Stethoscope className="h-3.5 w-3.5" />
                              {openVisita.cliente.nome_doutor}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(
                              openVisita.data_visita,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {openVisita.consultor?.nome_completo ?? "—"}
                          </span>
                        </DialogDescription>
                      </div>
                    </div>

                    {/* Status chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Chip
                        className={`${tempCfg.bg} ${tempCfg.text} ring-1 ${tempCfg.ring}`}
                      >
                        <TempIcon className="h-3.5 w-3.5" />
                        {tempCfg.label}
                      </Chip>
                      {openVisita.tipo_visita && (
                        <Chip className="bg-secondary/60 text-foreground ring-1 ring-border">
                          <Activity className="h-3.5 w-3.5" />
                          {openVisita.tipo_visita}
                        </Chip>
                      )}
                      {openVisita.gerou_pedido ? (
                        <Chip className="bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Pedido gerado
                        </Chip>
                      ) : (
                        <Chip className="bg-muted/40 text-muted-foreground ring-1 ring-border">
                          <XCircle className="h-3.5 w-3.5" />
                          Sem pedido
                        </Chip>
                      )}
                      {openVisita.gerou_orcamento && (
                        <Chip className="bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30">
                          <FileText className="h-3.5 w-3.5" />
                          Orçamento
                        </Chip>
                      )}
                    </div>
                  </DialogHeader>

                  <div className="px-6 py-6 flex-1 space-y-4">
                    <div className="space-y-6">
                    {/* Highlight stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <StatCard
                        icon={DollarSign}
                        label="Valor estimado"
                        value={
                          openVisita.valor_estimado != null
                            ? formatBRL(Number(openVisita.valor_estimado))
                            : "—"
                        }
                        accent
                      />
                      <StatCard
                        icon={Target}
                        label="Probabilidade"
                        value={openVisita.probabilidade_fechamento ?? "—"}
                      />
                      <StatCard
                        icon={TrendingUp}
                        label="Interesse"
                        value={
                          openVisita.interesse_escala != null
                            ? `${openVisita.interesse_escala}/5`
                            : "—"
                        }
                      />
                    </div>

                    {/* Highlight: Próximo passo (em evidência para gestor/diretor) */}
                    {(() => {
                      const proximo = openVisita.data_proximo_contato
                        ? new Date(
                            openVisita.data_proximo_contato,
                          ).toLocaleDateString("pt-BR")
                        : null;
                      const acao = openVisita.acao_prevista?.trim() || null;
                      const hoje = new Date();
                      hoje.setHours(0, 0, 0, 0);
                      const dataProx = openVisita.data_proximo_contato
                        ? new Date(
                            openVisita.data_proximo_contato + "T00:00:00",
                          )
                        : null;
                      const diffDias = dataProx
                        ? Math.round(
                            (dataProx.getTime() - hoje.getTime()) / 86400000,
                          )
                        : null;
                      const statusLabel =
                        diffDias == null
                          ? null
                          : diffDias < 0
                            ? `Atrasado ${Math.abs(diffDias)}d`
                            : diffDias === 0
                              ? "Hoje"
                              : diffDias === 1
                                ? "Amanhã"
                                : `Em ${diffDias} dias`;
                      const statusClass =
                        diffDias == null
                          ? "bg-muted/40 text-muted-foreground ring-border"
                          : diffDias < 0
                            ? "bg-rose-500/15 text-rose-300 ring-rose-500/30"
                            : diffDias <= 2
                              ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";

                      return (
                        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
                          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
                              <Target className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                              Próximo passo
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            <div className="rounded-xl bg-background/40 backdrop-blur-sm border border-border/60 p-4">
                              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                                <Calendar className="h-3.5 w-3.5" />
                                Próximo contato
                              </div>
                              <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-2xl font-bold text-foreground">
                                  {proximo ?? "Não agendado"}
                                </span>
                                {statusLabel && (
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusClass}`}
                                  >
                                    {statusLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="rounded-xl bg-background/40 backdrop-blur-sm border border-border/60 p-4">
                              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                                <Target className="h-3.5 w-3.5" />
                                Ação prevista
                              </div>
                              <p className="text-base font-medium text-foreground leading-snug">
                                {acao ?? (
                                  <span className="text-muted-foreground italic font-normal">
                                    Nenhuma ação registrada
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Cliente section */}
                    <Section icon={Building2} title="Cliente">
                      <DetailRow
                        icon={Building2}
                        label="Clínica"
                        value={openVisita.cliente?.nome_clinica ?? "—"}
                      />
                      <DetailRow
                        icon={Stethoscope}
                        label="Doutor(a)"
                        value={openVisita.cliente?.nome_doutor ?? "—"}
                      />
                      <DetailRow
                        icon={Phone}
                        label="Telefone"
                        value={openVisita.cliente?.telefone_contato ?? "—"}
                      />
                    </Section>

                    {/* Atendimento */}
                    <Section icon={ClipboardList} title="Atendimento">
                      <DetailRow
                        icon={User}
                        label="Atendente"
                        value={openVisita.atendente ?? "—"}
                      />
                      <DetailRow
                        icon={Briefcase}
                        label="Cargo"
                        value={openVisita.cargo_atendente ?? "—"}
                      />
                      <DetailRow
                        icon={Activity}
                        label="Tipo de visita"
                        value={openVisita.tipo_visita ?? "—"}
                      />
                    </Section>

                    {/* Notas */}
                    {(openVisita.feedback_cliente ||
                      openVisita.observacoes_vendedor) && (
                      <Section icon={MessageSquare} title="Notas">
                        {openVisita.feedback_cliente && (
                          <NoteBlock
                            icon={MessageSquare}
                            label="Feedback do cliente"
                          >
                            {openVisita.feedback_cliente}
                          </NoteBlock>
                        )}
                        {openVisita.observacoes_vendedor && (
                          <NoteBlock
                            icon={FileText}
                            label="Observações do vendedor"
                          >
                            {openVisita.observacoes_vendedor}
                          </NoteBlock>
                        )}
                      </Section>
                    )}

                    <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground border-t border-border/50">
                      <Clock className="h-3 w-3" />
                      Registrado em{" "}
                      {new Date(openVisita.criado_em).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1 ${full ? "md:col-span-2" : ""}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm whitespace-pre-wrap break-words">{children}</p>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: any;
  accent?: boolean;
  icon?: typeof TrendingUp;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-gold" />}
      </div>
      <p
        className={`mt-2 text-2xl font-bold ${accent ? "gradient-text-gold" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-4 border border-border/50">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className="h-3.5 w-3.5 text-gold" />
        {label}
      </div>
      <p
        className={`mt-2 text-lg font-bold ${accent ? "gradient-text-gold" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof TrendingUp;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold font-semibold">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border/50 bg-secondary/20 p-4">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  full,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${full ? "sm:col-span-2" : ""}`}>
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background/60 ring-1 ring-border/50">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
        <p className="text-sm text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

function NoteBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof TrendingUp;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:col-span-2 rounded-lg border border-border/40 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="text-sm whitespace-pre-wrap break-words text-foreground/90">
        {children}
      </p>
    </div>
  );
}
