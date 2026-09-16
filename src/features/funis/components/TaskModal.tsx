import { useState, useMemo, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  X,
  Plus,
  Trash2,
  GitBranch,
  Calendar as CalIcon,
  Flag,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { PRIORITIES, priorityMeta, type Priority } from "~/lib/task-meta";
import { toast } from "react-hot-toast";
import {
  useCriarTarefa,
  useAtualizarTarefa,
  useDeletarTarefa,
} from "../hooks/useFunisData";
import type { FunilTarefa } from "../types";
import { supabase } from "~/core/supabase";

type Props = {
  open?: boolean;
  onClose: () => void;
  columnId: string;
  funilId: string;
  task?: FunilTarefa | null;
  parentTaskId?: string | null;
  allTasks?: FunilTarefa[];
  canEdit?: boolean;
};

export function TaskModal({
  open = true,
  onClose,
  columnId,
  funilId,
  task,
  parentTaskId,
  allTasks = [],
  canEdit = true,
}: Props) {
  const criar = useCriarTarefa();
  const atualizar = useAtualizarTarefa();
  const deletar = useDeletarTarefa();

  const [profiles, setProfiles] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("users")
      .select("*")
      .then(({ data }) => {
        if (data) setProfiles(data);
      });
  }, []);

  const [title, setTitle] = useState(task?.titulo ?? "");
  const [description, setDescription] = useState(task?.descricao ?? "");
  const [assignedTo, setAssignedTo] = useState<string>(
    task?.atribuido_para ?? "none",
  );
  const [tools, setTools] = useState<string[]>(task?.tools ?? []);
  const [toolInput, setToolInput] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"period" | "dependency">(
    task?.depende_tarefa_id ? "dependency" : "period",
  );
  const [startDate, setStartDate] = useState(
    task?.data_inicio?.slice(0, 10) ?? "",
  );
  const [endDate, setEndDate] = useState(task?.data_fim?.slice(0, 10) ?? "");
  const [dependsOn, setDependsOn] = useState<string>(
    task?.depende_tarefa_id ?? "none",
  );
  const [priority, setPriority] = useState<Priority>(
    (task?.prioridade as Priority) ?? "medium",
  );
  const [completed, setCompleted] = useState<boolean>(!!task?.completed_at);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState<FunilTarefa | null>(null);

  const subtasks = useMemo(
    () => (task ? allTasks.filter((t) => t.parent_task_id === task.id) : []),
    [allTasks, task],
  );
  const candidateDeps = useMemo(
    () => allTasks.filter((t) => t.id !== task?.id && !t.parent_task_id),
    [allTasks, task],
  );

  const addTool = () => {
    if (toolInput.trim()) {
      setTools([...tools, toolInput.trim()]);
      setToolInput("");
    }
  };

  const saveIsPending = criar.isPending || atualizar.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      funil_id: funilId,
      coluna_id: columnId,
      parent_task_id: parentTaskId ?? task?.parent_task_id ?? null,
      titulo: title,
      descricao: description || undefined,
      atribuido_para: assignedTo === "none" ? null : assignedTo,
      tools: tools,
      data_inicio:
        scheduleMode === "period" && startDate
          ? new Date(startDate).toISOString()
          : null,
      data_fim:
        scheduleMode === "period" && endDate
          ? new Date(endDate).toISOString()
          : null,
      depende_tarefa_id:
        scheduleMode === "dependency" && dependsOn !== "none"
          ? dependsOn
          : null,
      prioridade: priority as any,
      completed_at:
        completed && !task?.completed_at
          ? new Date().toISOString()
          : !completed
            ? null
            : task?.completed_at,
    };
    try {
      if (task) {
        await atualizar.mutateAsync({ id: task.id, updates: payload });
        toast.success("Tarefa atualizada");
      } else {
        await criar.mutateAsync(payload as any);
        toast.success("Tarefa criada");
      }
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async () => {
    if (task) {
      try {
        await deletar.mutateAsync(task.id);
        toast.success("Tarefa excluida");
        onClose();
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const subProgress =
    task && !parentTaskId
      ? {
          done: subtasks.filter((s) => !!s.completed_at).length,
          total: subtasks.length,
        }
      : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col max-w-2xl">
        <DialogHeader className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>
                {task
                  ? "Editar tarefa"
                  : parentTaskId
                    ? "Nova microtarefa"
                    : "Nova tarefa"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={submit} className="px-6 py-6 flex-1 space-y-6">
          {/* Status e Conclusão (Mais discreto) */}
          <div className="flex items-center justify-between gap-4 py-2 border-b border-border/20">
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <Checkbox
                checked={completed}
                onCheckedChange={(v: boolean) => setCompleted(!!v)}
                disabled={!canEdit}
                className="h-5 w-5"
              />
              <span>
                {completed ? "Tarefa concluída" : "Marcar como concluída"}
              </span>
            </label>
            {task?.created_at && (
              <span className="text-xs text-muted-foreground">
                Criada em{" "}
                {new Date(task.created_at).toLocaleDateString("pt-BR")}
                {task.completed_at &&
                  ` • Fim: ${new Date(task.completed_at).toLocaleDateString("pt-BR")}`}
              </span>
            )}
          </div>

          <div className="space-y-5">
            {/* Título */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                Título
              </Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit}
                placeholder="O que será feito"
              />
            </div>

            {/* Grid de Atributos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Prioridade & Responsável */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                    Prioridade
                  </Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as Priority)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${priorityMeta(priority).dot}`}
                        />
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                            {p.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                    Responsável
                  </Label>
                  <Select
                    value={assignedTo}
                    onValueChange={setAssignedTo}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem responsável</SelectItem>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome || p.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Datas / Dependência */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Planejamento
                </Label>
                <div className="border border-border/40 rounded-lg p-3 bg-surface/10 space-y-3">
                  <Tabs
                    value={scheduleMode}
                    onValueChange={(v) =>
                      setScheduleMode(v as "period" | "dependency")
                    }
                  >
                    <TabsList className="grid grid-cols-2 w-full h-8 p-0.5 bg-muted/50">
                      <TabsTrigger
                        value="period"
                        disabled={!canEdit}
                        className="text-xs"
                      >
                        <CalIcon className="h-3 w-3 mr-1" />
                        Por período
                      </TabsTrigger>
                      <TabsTrigger
                        value="dependency"
                        disabled={!canEdit}
                        className="text-xs"
                      >
                        <GitBranch className="h-3 w-3 mr-1" />
                        Dependência
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="period"
                      className="grid grid-cols-2 gap-2 mt-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                          Início
                        </span>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          disabled={!canEdit}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                          Fim
                        </span>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          disabled={!canEdit}
                          className="h-8 text-xs"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="dependency" className="mt-3">
                      <Select
                        value={dependsOn}
                        onValueChange={setDependsOn}
                        disabled={!canEdit}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Tarefa predecessora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {candidateDeps.map((t) => (
                            <SelectItem
                              key={t.id}
                              value={t.id}
                              className="text-xs"
                            >
                              {t.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {dependsOn !== "none" && (
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          Inicia após a conclusão da predecessora.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                Descrição
              </Label>
              <Textarea
                rows={3}
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                placeholder="Escopo, contexto, critérios de aceite..."
                className="min-h-[80px] resize-y"
              />
            </div>

            {/* Ferramentas */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                Ferramentas
              </Label>
              <div className="flex gap-2">
                <Input
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTool();
                    }
                  }}
                  placeholder="n8n, Docker..."
                  disabled={!canEdit}
                  className="h-9"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTool}
                  disabled={!canEdit}
                  className="shrink-0 h-9"
                >
                  Adicionar
                </Button>
              </div>
              {tools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tools.map((t, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 py-1 px-2 text-xs"
                    >
                      {t}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setTools(tools.filter((_, j) => j !== i))
                          }
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Microtarefas */}
            {task && !parentTaskId && (
              <div className="border-t border-border/20 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                    Microtarefas{" "}
                    <span className="text-foreground/60 normal-case">
                      ({subProgress?.done ?? 0}/{subProgress?.total ?? 0})
                    </span>
                  </Label>
                  {canEdit && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSub(null);
                        setShowSubModal(true);
                      }}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
                {subProgress && subProgress.total > 0 && (
                  <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{
                        width:
                          Math.round(
                            (subProgress.done / subProgress.total) * 100,
                          ) + "%",
                      }}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {subtasks.map((st) => {
                    const sm = priorityMeta(st.prioridade);
                    return (
                      <div
                        key={st.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border bg-surface/20 hover:bg-surface/40 cursor-pointer transition-colors ${st.completed_at ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/30"}`}
                        onClick={() => {
                          setEditingSub(st);
                          setShowSubModal(true);
                        }}
                      >
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${sm.dot}`}
                          title={sm.label}
                        />
                        <span
                          className={`text-xs truncate flex-1 ${st.completed_at ? "line-through text-muted-foreground" : ""}`}
                        >
                          {st.titulo}
                        </span>
                        {st.completed_at ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          st.atribuido_para && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0 max-w-[80px] truncate">
                              {profiles.find((p) => p.id === st.atribuido_para)
                                ?.nome || "Membro"}
                            </span>
                          )
                        )}
                      </div>
                    );
                  })}
                  {subtasks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2 col-span-2">
                      Nenhuma microtarefa criada.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 border-t border-border/50 gap-3">
            {task && canEdit && (
              <Button
                type="button"
                variant="ghost-destructive"
                className="sm:mr-auto"
                onClick={remove}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Excluir
              </Button>
            )}
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
              Cancelar
            </button>
            {canEdit && (
              <button type="submit" disabled={saveIsPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {saveIsPending ? "Salvando..." : "Salvar"}
              </button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>

      {showSubModal && task && (
        <TaskModal
          open={showSubModal}
          onClose={() => setShowSubModal(false)}
          columnId={columnId}
          funilId={funilId}
          parentTaskId={task.id}
          task={editingSub}
          allTasks={allTasks}
          canEdit={canEdit}
        />
      )}
    </Dialog>
  );
}
