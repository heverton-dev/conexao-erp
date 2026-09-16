import { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useMinhasDespesas } from "../../hooks/useDespesas";
import { useTiposDespesa } from "../../hooks/useTiposDespesa";
import { useEmpresaSuperAdmin } from "../../hooks/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "../shared/EmpresaSuperAdminSelector";
import { PageHeader } from "~/components/ui/page-header";
import { Input } from "~/components/ui/input";
import { DespesaStatusBadge } from "../shared/StatusBadge";
import { DESPESA_STATUS_LABEL } from "../../types";
import type { DespesaFiltros } from "../../types";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function MeusRelatoriosPage() {
  const {
    empresaId,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
    isSuperAdmin,
  } = useEmpresaSuperAdmin();
  const [filtros, setFiltros] = useState<DespesaFiltros>({});
  const { data: despesas, isLoading } = useMinhasDespesas(filtros, empresaId);
  const { data: tipos } = useTiposDespesa(empresaId);

  const totalGeral = despesas?.reduce((acc, d) => acc + d.valor, 0) ?? 0;
  const totalAprovadoPago =
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

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Meus Relatórios"
        description="Acompanhe o resumo das suas despesas."
      />

      {isSuperAdmin && empresas.length > 0 && (
        <EmpresaSuperAdminSelector
          empresas={empresas}
          value={empresaSelecionada}
          onChange={setEmpresaSelecionada}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: "Total", value: totalGeral, color: "text-text-main" },
          {
            label: "Aprovado/Pago",
            value: totalAprovadoPago,
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
                    <span className="text-xs text-text-muted">
                      {formatarData(d.data_despesa)}
                      {d.descricao ? ` · ${d.descricao}` : ""}
                    </span>
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
                        {formatarData(d.data_despesa)}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted">
                        {d.tipo?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted truncate max-w-[200px]">
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
                      colSpan={5}
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
