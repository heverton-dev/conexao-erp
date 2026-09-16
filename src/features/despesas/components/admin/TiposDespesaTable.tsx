import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  useTiposDespesa,
  useExcluirTipoDespesa,
  useAtualizarTipoDespesa,
} from "../../hooks/useTiposDespesa";
import { TipoDespesaForm } from "./TipoDespesaForm";
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
import type { DespesaTipo } from "../../types";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function TiposDespesaTable({ empresaId }: { empresaId?: string }) {
  const { data: tipos, isLoading } = useTiposDespesa(empresaId);
  const excluir = useExcluirTipoDespesa(empresaId);
  const atualizar = useAtualizarTipoDespesa(empresaId);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<DespesaTipo | null>(null);
  const [deletar, setDeletar] = useState<DespesaTipo | null>(null);

  if (isLoading)
    return <div className="text-text-muted text-sm">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted hidden sm:block">
          Configure tipos de despesa e valores máximos.
        </p>
        <Button
          onClick={() => {
            setEditando(null);
            setFormOpen(true);
          }}
          size="sm"
          className="gap-1.5"
        >
          <Plus size={14} /> Novo Tipo
        </Button>
      </div>

      {/* Mobile: cards */}
      <div className="grid gap-2 sm:hidden">
        {tipos && tipos.length > 0 ? (
          tipos.map((tipo) => (
            <div
              key={tipo.id}
              className="rounded-xl bg-card border border-border px-3 py-2.5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-main">
                  {tipo.nome}
                </span>
                <span className="text-sm font-semibold text-text-main">
                  {formatarMoeda(tipo.valor_maximo)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    atualizar.mutate({
                      id: tipo.id,
                      updates: { ativo: !tipo.ativo },
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs"
                >
                  {tipo.ativo ? (
                    <>
                      <ToggleRight size={16} className="text-success" />{" "}
                      <span className="text-success">Ativo</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={16} className="text-text-muted" />{" "}
                      <span className="text-text-muted">Inativo</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditando(tipo);
                      setFormOpen(true);
                    }}
                    className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent/10"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletar(tipo)}
                    className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-text-muted text-sm">
            Nenhum tipo cadastrado.
          </div>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden sm:block border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover/30">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                Nome
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
                Valor Máximo
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
            {tipos && tipos.length > 0 ? (
              tipos.map((tipo) => (
                <tr
                  key={tipo.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface-hover/20 transition-colors"
                >
                  <td className="px-4 py-2.5 text-text-main font-medium">
                    {tipo.nome}
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-main">
                    {formatarMoeda(tipo.valor_maximo)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() =>
                        atualizar.mutate({
                          id: tipo.id,
                          updates: { ativo: !tipo.ativo },
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs"
                    >
                      {tipo.ativo ? (
                        <>
                          <ToggleRight size={18} className="text-success" />{" "}
                          <span className="text-success">Ativo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={18} className="text-text-muted" />{" "}
                          <span className="text-text-muted">Inativo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditando(tipo);
                          setFormOpen(true);
                        }}
                        className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletar(tipo)}
                        className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-colors"
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
                  colSpan={4}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  Nenhum tipo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TipoDespesaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editando={editando}
        empresaId={empresaId}
      />

      <AlertDialog
        open={!!deletar}
        onOpenChange={(o) => !o && setDeletar(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletar?.nome}&quot; será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletar) {
                  excluir.mutate(deletar.id);
                  setDeletar(null);
                }
              }}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
