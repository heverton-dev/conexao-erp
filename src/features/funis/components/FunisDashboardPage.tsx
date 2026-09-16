import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Trash2,
  Crown,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/components/ui/dialog";
import { toast } from "react-hot-toast";
import { Badge } from "~/components/ui/badge";
import {
  funnelProgress,
  statusMeta,
  fmtDate,
  dateRange,
} from "~/lib/task-meta";
import { useFunis, useCriarFunil } from "../hooks/useFunisData";
import { useAuth } from "~/lib/auth";

export function FunisDashboardPage() {
  const navigate = useNavigate();
  const { data: funis = [], isLoading } = useFunis();
  const criarFunil = useCriarFunil();
  const { profile } = useAuth();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<string[]>([
    "Backlog",
    "Em andamento",
    "Revisão",
    "Concluído",
  ]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const activeColumns = columns.map((c) => c.trim()).filter(Boolean);
      const result = await criarFunil.mutateAsync({
        titulo: title.trim(),
        descricao: description.trim() || undefined,
        colunas: activeColumns,
      });
      toast.success("Funil criado");
      setOpen(false);
      setTitle("");
      setDescription("");
      setColumns(["Backlog", "Em andamento", "Revisão", "Concluído"]);
      navigate({ to: "/funis/funil/$funilId", params: { funilId: result.id } });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:mb-10">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-display">Meus funis</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Quadros de gestão de projetos e fluxos de trabalho
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-[#0f172a] font-semibold w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo funil
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col max-w-lg">
            <DialogHeader className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="font-display text-2xl">Criar novo funil</DialogTitle>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleCreate} className="px-6 py-6 flex-1 space-y-5">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Refatoração do backend"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contexto e objetivo do funil"
                  className="min-h-[96px] resize-y"
                />
              </div>

              <div className="space-y-2.5">
                <Label>Etapas (Colunas)</Label>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {columns.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        required
                        value={col}
                        onChange={(e) => {
                          const newCols = [...columns];
                          newCols[idx] = e.target.value;
                          setColumns(newCols);
                        }}
                        placeholder={`Etapa ${idx + 1}`}
                        className="bg-background/50"
                      />
                      {columns.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost-destructive"
                          size="icon"
                          onClick={() => {
                            const newCols = columns.filter((_, i) => i !== idx);
                            setColumns(newCols);
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
                  onClick={() => setColumns([...columns, ""])}
                  className="w-full border-dashed border-border/60 hover:bg-surface/50 text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar etapa
                </Button>
              </div>

              <DialogFooter className="px-6 pb-6 pt-4 border-t border-border/50 gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criarFunil.isPending}
                  className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
                >
                  {criarFunil.isPending ? "Criando..." : "Criar funil"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-10 text-center">
          Carregando...
        </div>
      ) : funis.length === 0 ? (
        <Card className="p-10 sm:p-14 text-center bg-surface/50 border-dashed border-border/60">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-xl sm:text-2xl mb-2">
            Nenhum funil ainda
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Crie seu primeiro funil para começar a organizar projetos em Kanban.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="gradient-gold text-[#0f172a] font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar funil
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {funis.map((f: any) => {
            const tasks = f.tarefas ?? [];
            const prog = funnelProgress(tasks);
            const range = dateRange(tasks);
            const sm = statusMeta[prog.status];
            const isOwner = f.created_by === profile?.id;
            return (
              <Card
                key={f.id}
                className="group p-6 bg-surface/70 border-border/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer relative flex flex-col gap-4"
                onClick={() =>
                  navigate({
                    to: "/funis/funil/$funilId",
                    params: { funilId: f.id },
                  })
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg leading-tight min-w-0 truncate">
                    {f.titulo}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isOwner ? (
                      <Badge
                        variant="outline"
                        className="border-primary/40 text-primary gap-1"
                      >
                        <Crown className="h-3 w-3" />
                        Dono
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Convidado</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {f.descricao || "Sem descrição"}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {prog.done}/{prog.total} tarefas
                    </span>
                    <span className="font-mono font-semibold">{prog.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background/60 overflow-hidden">
                    <div
                      className={`h-full ${sm.bar} transition-all`}
                      style={{ width: prog.pct + "%" }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <Badge variant="outline" className={`gap-1 ${sm.chip}`}>
                    {prog.status === "completed" ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : prog.status === "overdue" ? (
                      <Clock className="h-2.5 w-2.5" />
                    ) : (
                      <Calendar className="h-2.5 w-2.5" />
                    )}
                    {sm.label}
                  </Badge>
                  {range.end && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-border/60 text-muted-foreground"
                    >
                      <Calendar className="h-2.5 w-2.5" />
                      Entrega {fmtDate(range.end)}
                    </Badge>
                  )}
                  <span className="text-muted-foreground ml-auto">
                    Criado {fmtDate(f.created_at)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
