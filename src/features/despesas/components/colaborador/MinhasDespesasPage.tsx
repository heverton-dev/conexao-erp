import { useState } from "react";
import { Plus, Send, Receipt, Eye, ChevronRight } from "lucide-react";
import { useMinhasDespesas } from "../../hooks/useDespesas";
import { useMeusEnvios } from "../../hooks/useEnvios";
import { useEmpresaSuperAdmin } from "../../hooks/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "../shared/EmpresaSuperAdminSelector";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { DespesaStatusBadge, EnvioStatusBadge } from "../shared/StatusBadge";
import { ComprovanteViewer } from "../shared/ComprovanteViewer";
import { NovaDespesaModal } from "./NovaDespesaModal";
import { EnviarDespesasModal } from "./EnviarDespesasModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import type { Despesa } from "../../types";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function MinhasDespesasPage() {
  const {
    empresaId,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
    isSuperAdmin,
  } = useEmpresaSuperAdmin();
  const { data: despesas, isLoading } = useMinhasDespesas(undefined, empresaId);
  const { data: envios } = useMeusEnvios(empresaId);
  const [detalhe, setDetalhe] = useState<Despesa | null>(null);
  const [modalNova, setModalNova] = useState(false);
  const [modalEnviar, setModalEnviar] = useState(false);

  const rascunhos = despesas?.filter((d) => d.status === "rascunho") ?? [];
  const totalRascunho = rascunhos.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Minhas Despesas"
        description="Lance e acompanhe suas despesas em rota."
      />

      {isSuperAdmin && empresas.length > 0 && (
        <EmpresaSuperAdminSelector
          empresas={empresas}
          value={empresaSelecionada}
          onChange={setEmpresaSelecionada}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={() => setModalNova(true)}
          className="gap-1.5 w-full sm:w-auto"
        >
          <Plus size={16} /> Nova Despesa
        </Button>
        {rascunhos.length > 0 && (
          <Button
            onClick={() => setModalEnviar(true)}
            variant="outline"
            className="gap-1.5 w-full sm:w-auto"
          >
            <Send size={16} /> Enviar ({rascunhos.length} —{" "}
            {formatarMoeda(totalRascunho)})
          </Button>
        )}
      </div>

      {envios && envios.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Envios
          </h3>
          <div className="grid gap-2">
            {envios.map((envio) => (
              <div
                key={envio.id}
                className="flex items-center justify-between rounded-xl bg-card border border-border px-3 py-2.5 md:px-4 md:py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-main truncate">
                    {envio.periodo
                      ? `${formatarData(envio.periodo.data_inicio)} — ${formatarData(envio.periodo.data_fim)}`
                      : "—"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {envio.total_despesas} despesas ·{" "}
                    {formatarMoeda(envio.valor_total)}
                  </p>
                </div>
                <EnvioStatusBadge status={envio.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-text-muted text-sm">Carregando...</div>
      ) : (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Despesas {rascunhos.length > 0 && `(${rascunhos.length} rascunhos)`}
          </h3>

          {/* Mobile: cards */}
          <div className="grid gap-2 md:hidden">
            {despesas && despesas.length > 0 ? (
              despesas.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDetalhe(d)}
                  className="flex items-center justify-between rounded-xl bg-card border border-border px-3 py-2.5 text-left hover:border-accent/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-text-main truncate">
                        {d.tipo?.nome ?? "—"}
                      </span>
                      <DespesaStatusBadge status={d.status} />
                    </div>
                    <p className="text-xs text-text-muted">
                      {formatarData(d.data_despesa)}
                      {d.descricao ? ` · ${d.descricao}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-semibold text-text-main whitespace-nowrap">
                      {formatarMoeda(d.valor)}
                    </span>
                    <ChevronRight size={16} className="text-text-muted/40" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted text-sm">
                Nenhuma despesa lançada.
              </div>
            )}
          </div>

          {/* Desktop: tabela */}
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
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                    Comprovante
                  </th>
                </tr>
              </thead>
              <tbody>
                {despesas && despesas.length > 0 ? (
                  despesas.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-hover/20 transition-colors cursor-pointer"
                      onClick={() => setDetalhe(d)}
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
                      <td className="px-4 py-2.5 text-center">
                        {d.comprovante_url ? (
                          <Eye size={14} className="mx-auto text-accent" />
                        ) : (
                          <span className="text-text-muted/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-text-muted"
                    >
                      Nenhuma despesa lançada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NovaDespesaModal open={modalNova} onOpenChange={setModalNova} />
      <EnviarDespesasModal open={modalEnviar} onOpenChange={setModalEnviar} />

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="bg-card max-w-md max-h-[90dvh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Receipt className="h-6 w-6" /></div>
              <div><DialogTitle>Detalhes da Despesa</DialogTitle><DialogDescription>Visualize os dados da despesa.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          {detalhe && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase">
                    Data
                  </p>
                  <p className="text-sm text-text-main">
                    {formatarData(detalhe.data_despesa)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase">
                    Tipo
                  </p>
                  <p className="text-sm text-text-main">
                    {detalhe.tipo?.nome ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase">
                    Valor
                  </p>
                  <p className="text-sm text-text-main font-medium">
                    {formatarMoeda(detalhe.valor)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase">
                    Status
                  </p>
                  <DespesaStatusBadge status={detalhe.status} />
                </div>
              </div>
              {detalhe.descricao && (
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase mb-1">
                    Descrição
                  </p>
                  <p className="text-sm text-text-main">{detalhe.descricao}</p>
                </div>
              )}
              {detalhe.status === "reprovada" &&
                detalhe.comentario_reprovacao && (
                  <div className="rounded-lg bg-error/5 border border-error/20 p-3">
                    <p className="text-[10px] font-semibold text-error uppercase mb-1">
                      Motivo da Reprovação
                    </p>
                    <p className="text-sm text-text-main">
                      {detalhe.comentario_reprovacao}
                    </p>
                  </div>
                )}
              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase mb-2">
                  Comprovante
                </p>
                <ComprovanteViewer
                  url={detalhe.comprovante_url}
                  tipo={detalhe.comprovante_tipo}
                />
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
