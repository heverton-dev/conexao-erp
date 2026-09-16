import { useState } from "react";
import { RefreshCw, Lock, Unlock, Trash2, CalendarPlus } from "lucide-react";
import toast from "react-hot-toast";
import {
  usePeriodos,
  useFecharPeriodo,
  useReabrirPeriodo,
  useExcluirPeriodo,
} from "../../hooks/usePeriodos";
import { GerarPeriodosModal } from "./GerarPeriodosModal";
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
import type { DespesaPeriodo } from "../../types";

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function PeriodosTable({ empresaId }: { empresaId?: string }) {
  const { data: periodos, isLoading } = usePeriodos(empresaId);
  const fechar = useFecharPeriodo(empresaId);
  const reabrir = useReabrirPeriodo(empresaId);
  const excluir = useExcluirPeriodo(empresaId);
  const [gerarModalOpen, setGerarModalOpen] = useState(false);
  const [periodoParaExcluir, setPeriodoParaExcluir] =
    useState<DespesaPeriodo | null>(null);

  function handleFechar(id: string) {
    fechar.mutate(id, {
      onSuccess: () => toast.success("Período fechado com sucesso!"),
      onError: (e) => toast.error("Erro ao fechar período: " + e.message),
    });
  }

  function handleReabrir(id: string) {
    reabrir.mutate(id, {
      onSuccess: () => toast.success("Período reaberto com sucesso!"),
      onError: (e) => toast.error("Erro ao reabrir período: " + e.message),
    });
  }

  function handleExcluir() {
    if (!periodoParaExcluir) return;
    excluir.mutate(periodoParaExcluir.id, {
      onSuccess: () => {
        toast.success("Período excluído com sucesso!");
        setPeriodoParaExcluir(null);
      },
      onError: (e) => {
        toast.error("Erro ao excluir período: " + e.message);
        setPeriodoParaExcluir(null);
      },
    });
  }

  if (isLoading)
    return <div className="text-text-muted text-sm">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted">Períodos de envio.</p>
        <Button
          onClick={() => setGerarModalOpen(true)}
          size="sm"
          variant="outline"
          className="gap-1.5"
        >
          <CalendarPlus size={14} />
          Gerar Períodos
        </Button>
      </div>

      {/* Mobile: cards */}
      <div className="grid gap-2 sm:hidden">
        {periodos && periodos.length > 0 ? (
          periodos.map((p) => (
            <div
              key={p.id}
              className="rounded-xl bg-card border border-border px-3 py-2.5 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-text-main">
                  {formatarData(p.data_inicio)} — {formatarData(p.data_fim)}
                </p>
                <span
                  className={`text-xs font-medium ${p.status === "aberto" ? "text-green-400" : "text-gray-400"}`}
                >
                  {p.status === "aberto" ? "Aberto" : "Fechado"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {p.status === "aberto" ? (
                  <button
                    onClick={() => handleFechar(p.id)}
                    className="p-1.5 rounded-md text-text-muted hover:text-warning hover:bg-warning/10"
                    title="Fechar"
                  >
                    <Lock size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReabrir(p.id)}
                    className="p-1.5 rounded-md text-text-muted hover:text-green-400 hover:bg-green-500/10"
                    title="Reabrir"
                  >
                    <Unlock size={14} />
                  </button>
                )}
                <button
                  onClick={() => setPeriodoParaExcluir(p)}
                  className="p-1.5 rounded-md text-text-muted hover:text-destructive hover:bg-destructive/10"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-text-muted text-sm">
            Nenhum período. Clique em &quot;Gerar&quot;.
          </div>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden sm:block border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover/30">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                Período
              </th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                Status
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {periodos && periodos.length > 0 ? (
              periodos.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface-hover/20 transition-colors"
                >
                  <td className="px-4 py-2.5 text-text-main font-medium">
                    {formatarData(p.data_inicio)} — {formatarData(p.data_fim)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "aberto" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}
                    >
                      {p.status === "aberto" ? "Aberto" : "Fechado"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === "aberto" ? (
                        <button
                          onClick={() => handleFechar(p.id)}
                          className="p-1.5 rounded-md text-text-muted hover:text-warning hover:bg-warning/10 transition-colors"
                          title="Fechar"
                        >
                          <Lock size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReabrir(p.id)}
                          className="p-1.5 rounded-md text-text-muted hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Reabrir"
                        >
                          <Unlock size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setPeriodoParaExcluir(p)}
                        className="p-1.5 rounded-md text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  Nenhum período gerado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={!!periodoParaExcluir}
        onOpenChange={(o) => !o && setPeriodoParaExcluir(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir período?</AlertDialogTitle>
            <AlertDialogDescription>
              {periodoParaExcluir && (
                <>
                  O período{" "}
                  <strong>
                    {formatarData(periodoParaExcluir.data_inicio)} —{" "}
                    {formatarData(periodoParaExcluir.data_fim)}
                  </strong>{" "}
                  será removido permanentemente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GerarPeriodosModal
        open={gerarModalOpen}
        onOpenChange={setGerarModalOpen}
        empresaId={empresaId}
      />
    </div>
  );
}
