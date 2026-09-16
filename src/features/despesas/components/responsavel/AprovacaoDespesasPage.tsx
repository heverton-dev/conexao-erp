import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  ChevronRight,
} from "lucide-react";
import {
  useEnviosPendentes,
  useAprovarEnvio,
  useReprovarEnvio,
} from "../../hooks/useEnvios";
import { useDespesasEmpresa } from "../../hooks/useDespesas";
import { useCriarPagamento } from "../../hooks/usePagamento";
import { useEmpresaSuperAdmin } from "../../hooks/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "../shared/EmpresaSuperAdminSelector";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { EnvioStatusBadge, DespesaStatusBadge } from "../shared/StatusBadge";
import { ComprovanteViewer } from "../shared/ComprovanteViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { DespesaEnvio, FormaPagamento } from "../../types";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function AprovacaoDespesasPage() {
  const {
    empresaId,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
    isSuperAdmin,
  } = useEmpresaSuperAdmin();
  const { data: envios, isLoading } = useEnviosPendentes(empresaId);
  const [envioSelecionado, setEnvioSelecionado] = useState<DespesaEnvio | null>(
    null,
  );
  const [reprovarEnvio, setReprovarEnvio] = useState<DespesaEnvio | null>(null);
  const [pagamentoEnvio, setPagamentoEnvio] = useState<DespesaEnvio | null>(
    null,
  );
  const [motivoReprovacao, setMotivoReprovacao] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [dataPagamento, setDataPagamento] = useState("");

  const { data: despesasEnvio } = useDespesasEmpresa(
    envioSelecionado ? { periodo_id: envioSelecionado.periodo_id } : undefined,
    empresaId,
  );
  const aprovar = useAprovarEnvio();
  const reprovar = useReprovarEnvio();
  const criarPagamento = useCriarPagamento();

  const despesasDoEnvio =
    despesasEnvio?.filter(
      (d) => d.usuario_id === envioSelecionado?.usuario_id,
    ) ?? [];

  async function handleAprovar() {
    if (!envioSelecionado) return;
    await aprovar.mutateAsync(envioSelecionado.id);
    setPagamentoEnvio(envioSelecionado);
    setEnvioSelecionado(null);
  }

  async function handleReprovar() {
    if (!reprovarEnvio || !motivoReprovacao.trim()) return;
    await reprovar.mutateAsync({
      id: reprovarEnvio.id,
      comentario: motivoReprovacao,
    });
    setReprovarEnvio(null);
    setMotivoReprovacao("");
  }

  async function handleDefinirPagamento() {
    if (!pagamentoEnvio || !dataPagamento) return;
    await criarPagamento.mutateAsync({
      empresa_id: pagamentoEnvio.empresa_id,
      envio_id: pagamentoEnvio.id,
      valor: pagamentoEnvio.valor_total,
      forma_pagamento: formaPagamento,
      data_pagamento: dataPagamento,
    });
    setPagamentoEnvio(null);
    setDataPagamento("");
  }

  const nomeUsuario = (envio: DespesaEnvio) =>
    envio.usuario?.nome ?? envio.usuario?.email ?? "—";

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Aprovação de Despesas"
        description="Analise e aprove/reprove os envios de despesas da equipe."
      />

      {isSuperAdmin && empresas.length > 0 && (
        <EmpresaSuperAdminSelector
          empresas={empresas}
          value={empresaSelecionada}
          onChange={setEmpresaSelecionada}
        />
      )}

      {isLoading ? (
        <div className="text-text-muted text-sm">Carregando...</div>
      ) : envios && envios.length > 0 ? (
        <div className="grid gap-2">
          {envios.map((envio) => (
            <button
              key={envio.id}
              onClick={() => setEnvioSelecionado(envio)}
              className="flex items-center justify-between rounded-xl bg-card border border-border px-3 py-3 md:px-5 md:py-4 text-left hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-accent">
                    {nomeUsuario(envio)[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-main truncate">
                    {nomeUsuario(envio)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {envio.periodo
                      ? `${formatarData(envio.periodo.data_inicio)} — ${formatarData(envio.periodo.data_fim)}`
                      : "—"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {envio.total_despesas} despesas ·{" "}
                    {formatarMoeda(envio.valor_total)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <EnvioStatusBadge status={envio.status} />
                <ChevronRight size={16} className="text-text-muted/40" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 md:py-16">
          <CheckCircle size={40} className="mx-auto text-success/30 mb-2" />
          <p className="text-text-muted text-sm">
            Nenhum envio pendente de aprovação.
          </p>
        </div>
      )}

      {/* Modal de análise */}
      <Dialog
        open={!!envioSelecionado}
        onOpenChange={(o) => !o && setEnvioSelecionado(null)}
      >
        <DialogContent className="bg-card max-w-2xl max-h-[90dvh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><FileText className="h-6 w-6" /></div>
              <div><DialogTitle>
                Analisar — {envioSelecionado ? nomeUsuario(envioSelecionado) : ""}
              </DialogTitle><DialogDescription>Analise as despesas enviadas pelo colaborador.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          {envioSelecionado && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-hover/30">
                <div>
                  <p className="text-sm font-medium text-text-main">
                    {envioSelecionado.periodo
                      ? `${formatarData(envioSelecionado.periodo.data_inicio)} — ${formatarData(envioSelecionado.periodo.data_fim)}`
                      : "—"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {envioSelecionado.total_despesas} despesas
                  </p>
                </div>
                <p className="text-lg font-bold text-accent">
                  {formatarMoeda(envioSelecionado.valor_total)}
                </p>
              </div>

              <div className="space-y-2">
                {despesasDoEnvio.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border hover:bg-surface-hover/20"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-main">
                        {d.tipo?.nome ?? "—"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatarData(d.data_despesa)}{" "}
                        {d.descricao ? `· ${d.descricao}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-sm font-semibold text-text-main">
                        {formatarMoeda(d.valor)}
                      </span>
                      <ComprovanteViewer
                        url={d.comprovante_url}
                        tipo={d.comprovante_tipo}
                      />
                      <DespesaStatusBadge status={d.status} />
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEnvioSelecionado(null)}
                  className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
                >
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setReprovarEnvio(envioSelecionado);
                    setEnvioSelecionado(null);
                  }}
                  className="flex-1 sm:flex-none rounded-xl gap-1"
                >
                  <XCircle size={16} /> Reprovar
                </Button>
                <Button
                  onClick={handleAprovar}
                  disabled={aprovar.isPending}
                  className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px] gap-1"
                >
                  <CheckCircle size={16} />{" "}
                  {aprovar.isPending ? "Aprovando..." : "Aprovar"}
                </Button>
              </DialogFooter>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de reprovação */}
      <AlertDialog
        open={!!reprovarEnvio}
        onOpenChange={(o) => !o && setReprovarEnvio(null)}
      >
        <AlertDialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><XCircle className="h-6 w-6" /></div>
              <div><AlertDialogTitle>Reprovar envio?</AlertDialogTitle>
              <AlertDialogDescription>
                Informe o motivo da reprovação. O colaborador será notificado.
              </AlertDialogDescription></div>
            </div>
          </AlertDialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
            <Label htmlFor="motivo">Motivo da reprovação *</Label>
            <Input
              id="motivo"
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              placeholder="Descreva o motivo..."
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReprovar}
              disabled={!motivoReprovacao.trim() || reprovar.isPending}
              className="flex-1 sm:flex-none rounded-xl bg-destructive px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent/20 hover:bg-destructive/90 disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              {reprovar.isPending ? "Reprovando..." : "Reprovar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de definir pagamento */}
      <Dialog
        open={!!pagamentoEnvio}
        onOpenChange={(o) => !o && setPagamentoEnvio(null)}
      >
        <DialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><CheckCircle className="h-6 w-6" /></div>
              <div><DialogTitle>Definir Pagamento</DialogTitle><DialogDescription>Configure o pagamento da despesa aprovada.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          {pagamentoEnvio && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                {nomeUsuario(pagamentoEnvio)} —{" "}
                {formatarMoeda(pagamentoEnvio.valor_total)}
              </p>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <select
                  value={formaPagamento}
                  onChange={(e) =>
                    setFormaPagamento(e.target.value as FormaPagamento)
                  }
                  className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-main"
                >
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Data de Pagamento</Label>
                <Input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPagamentoEnvio(null)}
                  className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
                >
                  Pular
                </Button>
                <Button
                  onClick={handleDefinirPagamento}
                  disabled={!dataPagamento || criarPagamento.isPending}
                  className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
                >
                  {criarPagamento.isPending ? "Salvando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
