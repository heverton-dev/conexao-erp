import { useState } from "react";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";
import { useMinhasDespesas } from "../../hooks/useDespesas";
import { usePeriodosAbertos } from "../../hooks/usePeriodos";
import { usePrazoEnvio } from "../../hooks/usePrazoEnvio";
import { criarOuAtualizarEnvio } from "../../services/envios.service";
import { enviarDespesas } from "../../services/despesas.service";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
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

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function EnviarDespesasModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [periodoId, setPeriodoId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { profile } = useAuth();
  const empresa_id = EMPRESA_ID;
  const usuario_id = profile?.id ?? "";
  const { data: periodos } = usePeriodosAbertos();
  const { data: despesas, isLoading } = useMinhasDespesas({
    periodo_id: periodoId || undefined,
  });

  const rascunhos = despesas?.filter((d) => d.status === "rascunho") ?? [];
  const total = rascunhos.reduce((acc, d) => acc + d.valor, 0);
  const {
    prazoExpirado,
    diasRestantes,
    deadline,
    isLoading: prazoLoading,
  } = usePrazoEnvio(periodoId);

  async function handleEnviar() {
    if (!periodoId || !empresa_id || !usuario_id) return;
    setSending(true);
    try {
      await criarOuAtualizarEnvio(usuario_id, periodoId);
      await enviarDespesas(periodoId, usuario_id);
      setConfirmOpen(false);
      setPeriodoId("");
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card max-w-md max-h-[90dvh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Send className="h-6 w-6" /></div>
              <div><DialogTitle>Enviar Despesas</DialogTitle><DialogDescription>Envie suas despesas para aprovação.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase">
                Período
              </label>
              <select
                value={periodoId}
                onChange={(e) => setPeriodoId(e.target.value)}
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-main"
              >
                <option value="">Selecione o período</option>
                {periodos?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatarData(p.data_inicio)} — {formatarData(p.data_fim)}
                  </option>
                ))}
              </select>
            </div>

            {periodoId && (
              <>
                {!prazoLoading && prazoExpirado && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-error/10 border border-error/20">
                    <AlertTriangle
                      size={18}
                      className="text-error shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-error">
                        Prazo de envio expirado
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        O prazo para enviar despesas deste período era até{" "}
                        {deadline?.toLocaleDateString("pt-BR")}. Entre em
                        contato com o administrador.
                      </p>
                    </div>
                  </div>
                )}
                {!prazoLoading &&
                  !prazoExpirado &&
                  diasRestantes > 0 &&
                  diasRestantes <= 3 && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
                      <AlertTriangle
                        size={18}
                        className="text-warning shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-warning">
                        Prazo de envio termina em {diasRestantes} dia
                        {diasRestantes !== 1 ? "s" : ""}.
                      </p>
                    </div>
                  )}
                {isLoading ? (
                  <div className="text-text-muted text-sm">Carregando...</div>
                ) : rascunhos.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle
                      size={40}
                      className="mx-auto text-success/30 mb-2"
                    />
                    <p className="text-text-muted text-sm">
                      Nenhuma despesa em rascunho para este período.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border border-border rounded-xl overflow-hidden max-h-[40vh] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-surface-hover/30">
                          <tr className="border-b border-border">
                            <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase">
                              Data
                            </th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase">
                              Tipo
                            </th>
                            <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase">
                              Valor
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rascunhos.map((d) => (
                            <tr
                              key={d.id}
                              className="border-b border-border/50 last:border-0"
                            >
                              <td className="px-3 py-2 text-text-main">
                                {formatarData(d.data_despesa)}
                              </td>
                              <td className="px-3 py-2 text-text-muted">
                                {d.tipo?.nome ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-right text-text-main font-medium">
                                {formatarMoeda(d.valor)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/20">
                      <div>
                        <p className="text-sm font-semibold text-text-main">
                          {rascunhos.length} despesa(s)
                        </p>
                        <p className="text-xs text-text-muted">
                          Total: {formatarMoeda(total)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <DialogFooter>
              <button type="button" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={
                  !periodoId ||
                  rascunhos.length === 0 ||
                  sending ||
                  prazoExpirado
                }
                className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px] gap-1.5"
              >
                <Send size={16} />
                {prazoExpirado
                  ? "Prazo expirado"
                  : sending
                    ? "Enviando..."
                    : "Enviar"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Send className="h-6 w-6" /></div>
              <div><AlertDialogTitle>Enviar despesas?</AlertDialogTitle>
              <AlertDialogDescription>
                {rascunhos.length} despesa(s) totalizando {formatarMoeda(total)}{" "}
                serão enviadas para aprovação.
              </AlertDialogDescription></div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnviar} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
