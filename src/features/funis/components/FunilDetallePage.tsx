import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Settings,
  Share2,
  Pencil,
  Trash2,
  LayoutGrid,
  GanttChart,
  CalendarDays,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  useFunil,
  useAtualizarFunil,
  useDeletarFunil,
  useCriarColuna,
  useAtualizarColuna,
  useDeletarColuna,
} from "../hooks/useFunisData";
import { KanbanView } from "./KanbanView";
import { TimelineView } from "./TimelineView";
import { CalendarView } from "./CalendarView";
import { ShareModal } from "./ShareModal";
import { useAuth } from "~/lib/auth";
import { toast } from "react-hot-toast";
import { cn } from "~/lib/utils";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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

export function FunilDetallePage() {
  const { funilId } = useParams({ strict: false }) as { funilId: string };
  const navigate = useNavigate();
  const { data: funil, isLoading } = useFunil(funilId);
  const { profile } = useAuth();

  const atualizarFunil = useAtualizarFunil();
  const deletarFunil = useDeletarFunil();
  const criarColuna = useCriarColuna();
  const atualizarColuna = useAtualizarColuna();
  const deletarColuna = useDeletarColuna();

  const [showShare, setShowShare] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "timeline" | "calendar">("kanban");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColumns, setEditColumns] = useState<
    { id?: string; titulo: string; posicao: number }[]
  >([]);

  if (isLoading) {
    return <div className="p-6 text-center text-text-muted">Carregando...</div>;
  }

  if (!funil) {
    return (
      <div className="p-6 text-center text-text-muted">
        Funil não encontrado
      </div>
    );
  }

  const isOwner = funil.created_by === profile?.id;

  const handleOpenEdit = () => {
    setEditTitle(funil.titulo);
    setEditDescription(funil.descricao || "");
    setEditColumns(
      funil.colunas
        ? [...funil.colunas]
            .sort((a: any, b: any) => a.posicao - b.posicao)
            .map((c: any) => ({
              id: c.id,
              titulo: c.titulo,
              posicao: c.posicao,
            }))
        : [],
    );
    setShowEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      await atualizarFunil.mutateAsync({
        id: funil.id,
        input: {
          titulo: editTitle.trim(),
          descricao: editDescription.trim() || undefined,
        },
      });

      // Sincronizar colunas
      const originalColIds = funil.colunas?.map((c: any) => c.id) || [];
      const currentCols = editColumns
        .map((c) => c.id)
        .filter(Boolean) as string[];
      const removedColIds = originalColIds.filter(
        (id: string) => !currentCols.includes(id),
      );

      for (const id of removedColIds) {
        await deletarColuna.mutateAsync(id);
      }

      for (let i = 0; i < editColumns.length; i++) {
        const col = editColumns[i];
        const activeTitle = col.titulo.trim();
        if (!activeTitle) continue;

        if (col.id) {
          const original = funil.colunas?.find((c: any) => c.id === col.id);
          if (
            original &&
            (original.titulo !== activeTitle || original.posicao !== i)
          ) {
            await atualizarColuna.mutateAsync({
              id: col.id,
              input: { titulo: activeTitle, posicao: i },
            });
          }
        } else {
          await criarColuna.mutateAsync({
            funil_id: funil.id,
            titulo: activeTitle,
            posicao: i,
          });
        }
      }

      toast.success("Funil atualizado");
      setShowEdit(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deletarFunil.mutateAsync(funil.id);
      toast.success("Funil excluído");
      navigate({ to: "/funis/dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/funis/dashboard" })}
            className="btn-hover-neutral p-1.5 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              {funil.titulo}
            </h1>
            {funil.descricao && (
              <p className="text-sm text-text-muted mt-1">{funil.descricao}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-surface-hover/50 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "kanban"
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:text-text-main"
              )}
              title="Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "timeline"
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:text-text-main"
              )}
              title="Timeline"
            >
              <GanttChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "calendar"
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:text-text-main"
              )}
              title="Calendário"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="btn-hover-neutral p-2 rounded-lg"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {isOwner && (
            <>
              <button
                onClick={handleOpenEdit}
                className="btn-hover-edit p-2 rounded-lg"
                title="Editar funil"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="btn-hover-destructive p-2 rounded-lg"
                title="Excluir funil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === "kanban" && <KanbanView funil={funil} />}
        {viewMode === "timeline" && <TimelineView funil={funil} />}
        {viewMode === "calendar" && <CalendarView funil={funil} />}
      </div>

      {showShare && (
        <ShareModal funilId={funilId} onClose={() => setShowShare(false)} />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col max-w-lg">
          <AlertDialogHeader className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <AlertDialogTitle>Excluir funil?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é permanente. Todas as colunas e tarefas serão
                  removidas.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 pb-6 pt-4 border-t border-border/50 gap-3">
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 sm:flex-none rounded-xl bg-destructive px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-destructive/20 hover:bg-destructive/90 disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col max-w-lg">
          <DialogHeader className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Pencil className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-text-main tracking-tight">
                  Editar funil
                </DialogTitle>
                <DialogDescription>Atualize as informações do funil</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="px-6 py-6 flex-1 space-y-5">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Ex.: Refatoração do backend"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Contexto e objetivo do funil"
                className="min-h-[96px] resize-y"
              />
            </div>

            <div className="space-y-2.5">
              <Label>Etapas (Colunas)</Label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {editColumns.map((col, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      required
                      value={col.titulo}
                      onChange={(e) => {
                        const newCols = [...editColumns];
                        newCols[idx] = {
                          ...newCols[idx],
                          titulo: e.target.value,
                        };
                        setEditColumns(newCols);
                      }}
                      placeholder={`Etapa ${idx + 1}`}
                      className="bg-background/50"
                    />
                    {editColumns.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost-destructive"
                        size="icon"
                        onClick={() => {
                          const newCols = editColumns.filter(
                            (_, i) => i !== idx,
                          );
                          setEditColumns(newCols);
                        }}
                        className="shrink-0 h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditColumns([
                    ...editColumns,
                    { titulo: "", posicao: editColumns.length },
                  ])
                }
                className="w-full border-dashed border-border/60 hover:bg-surface/50 text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar etapa
              </Button>
            </div>
            <DialogFooter className="px-6 pb-6 pt-4 border-t border-border/50 gap-3">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={atualizarFunil.isPending}
                className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
              >
                {atualizarFunil.isPending ? "Salvando..." : "Salvar alterações"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
