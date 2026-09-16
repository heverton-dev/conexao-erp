import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Users, Tag, Search } from "lucide-react";
import { useDespesasEmpresa } from "../../hooks/useDespesas";
import { useTiposDespesa } from "../../hooks/useTiposDespesa";
import { useEmpresaSuperAdmin } from "../../hooks/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "../shared/EmpresaSuperAdminSelector";
import { PageHeader } from "~/components/ui/page-header";
import { Input } from "~/components/ui/input";
import { DespesaStatusBadge } from "../shared/StatusBadge";
import { DESPESA_STATUS_LABEL } from "../../types";
import type { Despesa, DespesaFiltros } from "../../types";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

function nomeUsuario(u: Despesa["usuario"]): string {
  if (!u) return "—";
  return u.nome || u.email?.split("@")[0] || "—";
}

interface RankingItem {
  nome: string;
  total: number;
  quantidade: number;
}

export function RelatoriosDespesasPage() {
  const {
    empresaId,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
    isSuperAdmin,
  } = useEmpresaSuperAdmin();
  const [filtros, setFiltros] = useState<DespesaFiltros>({});
  const { data: despesas, isLoading } = useDespesasEmpresa(filtros, empresaId);
  const { data: tipos } = useTiposDespesa(empresaId);

  const colaboradores = useMemo(() => {
    if (!despesas) return [];
    const map = new Map<string, string>();
    for (const d of despesas) {
      if (d.usuario_id && !map.has(d.usuario_id)) {
        map.set(d.usuario_id, nomeUsuario(d.usuario));
      }
    }
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [despesas]);

  const totalGeral = despesas?.reduce((acc, d) => acc + d.valor, 0) ?? 0;
  const totalAprovado =
    despesas
      ?.filter((d) => d.status === "aprovada" || d.status === "paga")
      .reduce((acc, d) => acc + d.valor, 0) ?? 0;
  const totalPendente =
    despesas
      ?.filter((d) => d.status === "pendente")
      .reduce((acc, d) => acc + d.valor, 0) ?? 0;
  const totalReprovado =
    despesas
      ?.filter((d) => d.status === "reprovada")
      .reduce((acc, d) => acc + d.valor, 0) ?? 0;

  const rankingColaboradores = useMemo(() => {
    if (!despesas) return [];
    const map = new Map<
      string,
      { nome: string; total: number; count: number }
    >();
    for (const d of despesas) {
      const id = d.usuario_id;
      if (!map.has(id))
        map.set(id, { nome: nomeUsuario(d.usuario), total: 0, count: 0 });
      const item = map.get(id)!;
      item.total += d.valor;
      item.count += 1;
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [despesas]);

  const rankingCategorias = useMemo(() => {
    if (!despesas) return [];
    const map = new Map<
      string,
      { nome: string; total: number; count: number }
    >();
    for (const d of despesas) {
      const id = d.tipo_id;
      const nome = d.tipo?.nome ?? "—";
      if (!map.has(id)) map.set(id, { nome, total: 0, count: 0 });
      const item = map.get(id)!;
      item.total += d.valor;
      item.count += 1;
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [despesas]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Dashboard de Despesas"
        description="Visão geral das despesas de todos os colaboradores."
      />

      {isSuperAdmin && empresas.length > 0 && (
        <EmpresaSuperAdminSelector
          empresas={empresas}
          value={empresaSelecionada}
          onChange={setEmpresaSelecionada}
        />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: "Total", value: totalGeral, color: "text-text-main" },
          {
            label: "Aprovado/Pago",
            value: totalAprovado,
            color: "text-success",
          },
          { label: "Pendente", value: totalPendente, color: "text-warning" },
          { label: "Reprovado", value: totalReprovado, color: "text-error" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-card p-3 md:p-4 border border-border"
          >
            <p className="text-[10px] md:text-xs text-text-muted font-medium uppercase tracking-wider mb-0.5">
              {card.label}
            </p>
            <p className={`text-lg md:text-xl font-bold ${card.color}`}>
              {formatarMoeda(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <select
          value={filtros.usuario_id ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({
              ...f,
              usuario_id: e.target.value || undefined,
            }))
          }
          className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-main flex-1 min-w-0"
        >
          <option value="">Todos os colaboradores</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={filtros.data_inicio ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({
              ...f,
              data_inicio: e.target.value || undefined,
            }))
          }
          className="flex-1 min-w-0"
          placeholder="Data inicial"
        />
        <Input
          type="date"
          value={filtros.data_fim ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, data_fim: e.target.value || undefined }))
          }
          className="flex-1 min-w-0"
          placeholder="Data final"
        />
        <select
          value={filtros.tipo_id ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, tipo_id: e.target.value || undefined }))
          }
          className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-main flex-1 min-w-0"
        >
          <option value="">Todos os tipos</option>
          {tipos?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        <select
          value={filtros.status ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({
              ...f,
              status: (e.target.value || undefined) as any,
            }))
          }
          className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-main flex-1 min-w-0"
        >
          <option value="">Todos os status</option>
          {Object.entries(DESPESA_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-text-muted text-sm py-8 text-center">
          Carregando...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-xl bg-card border border-border p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-accent" />
                <h3 className="text-sm font-semibold text-text-main">
                  Ranking por Colaborador
                </h3>
              </div>
              {rankingColaboradores.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  Nenhum dado disponível.
                </p>
              ) : (
                <div className="space-y-3">
                  {rankingColaboradores.map((item, i) => {
                    const maxValor = rankingColaboradores[0]?.total || 1;
                    return (
                      <div key={item.nome}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-text-muted w-5 shrink-0">
                              #{i + 1}
                            </span>
                            <span className="text-sm text-text-main truncate">
                              {item.nome}
                            </span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-sm font-semibold text-text-main">
                              {formatarMoeda(item.total)}
                            </span>
                            <span className="text-[10px] text-text-muted ml-1">
                              ({item.count}x)
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-hover/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{
                              width: `${(item.total / maxValor) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-card border border-border p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-accent" />
                <h3 className="text-sm font-semibold text-text-main">
                  Ranking por Categoria
                </h3>
              </div>
              {rankingCategorias.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  Nenhum dado disponível.
                </p>
              ) : (
                <div className="space-y-3">
                  {rankingCategorias.map((item, i) => {
                    const maxValor = rankingCategorias[0]?.total || 1;
                    return (
                      <div key={item.nome}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-text-muted w-5 shrink-0">
                              #{i + 1}
                            </span>
                            <span className="text-sm text-text-main truncate">
                              {item.nome}
                            </span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-sm font-semibold text-text-main">
                              {formatarMoeda(item.total)}
                            </span>
                            <span className="text-[10px] text-text-muted ml-1">
                              ({item.count}x)
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-hover/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-success transition-all"
                            style={{
                              width: `${(item.total / maxValor) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2 md:hidden">
            {despesas && despesas.length > 0 ? (
              despesas.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl bg-card border border-border px-3 py-2.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-main">
                      {d.tipo?.nome ?? "—"}
                    </span>
                    <span className="text-sm font-semibold text-text-main">
                      {formatarMoeda(d.valor)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs text-text-muted truncate">
                        {nomeUsuario(d.usuario)}
                      </span>
                      <span className="text-text-muted/30">·</span>
                      <span className="text-xs text-text-muted">
                        {formatarData(d.data_despesa)}
                      </span>
                    </div>
                    <DespesaStatusBadge status={d.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted text-sm">
                Nenhuma despesa encontrada.
              </div>
            )}
          </div>

          <div className="hidden md:block border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-hover/30">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                    Colaborador
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                    Data
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                    Descrição
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                    Valor
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {despesas && despesas.length > 0 ? (
                  despesas.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-hover/20 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-text-main">
                        {nomeUsuario(d.usuario)}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted">
                        {formatarData(d.data_despesa)}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted">
                        {d.tipo?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted truncate max-w-[150px]">
                        {d.descricao || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-text-main font-medium">
                        {formatarMoeda(d.valor)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <DespesaStatusBadge status={d.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-text-muted"
                    >
                      Nenhuma despesa encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
