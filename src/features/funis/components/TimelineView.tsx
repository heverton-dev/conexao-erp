import { useMemo, useState } from "react";
import { format, differenceInDays, addDays, startOfDay, isWithinInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Funil, FunilTarefa } from "../types";
import { TaskModal } from "./TaskModal";
import { cn } from "~/lib/utils";

type TimelineViewProps = {
  funil: Funil;
};

const PRIORITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  urgent: { bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-400" },
  high: { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-400" },
  medium: { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400" },
  low: { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400" },
};

export function TimelineView({ funil }: TimelineViewProps) {
  const colunas = funil.colunas ?? [];
  const tarefas = funil.tarefas ?? [];
  const [editingTask, setEditingTask] = useState<FunilTarefa | null>(null);

  const tarefasComDatas = useMemo(() => {
    return tarefas.filter(
      (t) => !t.parent_task_id && (t.data_inicio || t.data_fim),
    );
  }, [tarefas]);

  const { days, startDate, totalDays } = useMemo(() => {
    if (tarefasComDatas.length === 0) {
      const today = startOfDay(new Date());
      return {
        days: Array.from({ length: 14 }, (_, i) => addDays(today, i)),
        startDate: today,
        totalDays: 14,
      };
    }

    const allStarts = tarefasComDatas
      .map((t) => t.data_inicio ? new Date(t.data_inicio) : null)
      .filter(Boolean) as Date[];
    const allEnds = tarefasComDatas
      .map((t) => t.data_fim ? new Date(t.data_fim) : null)
      .filter(Boolean) as Date[];

    const minDate = new Date(Math.min(...allStarts.map(d => d.getTime()), ...allEnds.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allStarts.map(d => d.getTime()), ...allEnds.map(d => d.getTime())));

    const start = startOfDay(addDays(minDate, -1));
    const end = addDays(maxDate, 2);
    const total = differenceInDays(end, start) + 1;

    return {
      days: Array.from({ length: total }, (_, i) => addDays(start, i)),
      startDate: start,
      totalDays: total,
    };
  }, [tarefasComDatas]);

  const getBarPosition = (tarefa: FunilTarefa) => {
    const start = tarefa.data_inicio ? startOfDay(new Date(tarefa.data_inicio)) : startOfDay(new Date(tarefa.created_at));
    const end = tarefa.data_fim ? startOfDay(new Date(tarefa.data_fim)) : addDays(start, 1);

    const startOffset = differenceInDays(start, startDate);
    const duration = Math.max(differenceInDays(end, start), 1);

    return { left: `${(startOffset / totalDays) * 100}%`, width: `${(duration / totalDays) * 100}%` };
  };

  const getTarefasPorColuna = (colunaId: string) => {
    return tarefasComDatas.filter((t) => t.coluna_id === colunaId);
  };

  const getColunaColor = (index: number) => {
    const colors = [
      "from-blue-500/20 to-blue-600/10",
      "from-purple-500/20 to-purple-600/10",
      "from-emerald-500/20 to-emerald-600/10",
      "from-amber-500/20 to-amber-600/10",
      "from-rose-500/20 to-rose-600/10",
      "from-cyan-500/20 to-cyan-600/10",
    ];
    return colors[index % colors.length];
  };

  if (tarefasComDatas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted">
        <p className="text-lg font-medium">Nenhuma tarefa com datas definidas</p>
        <p className="text-sm mt-1">Defina datas de início e/ou fim nas tarefas para visualizar na timeline</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header com datas */}
      <div className="flex border-b border-border/50 shrink-0">
        <div className="w-56 shrink-0 px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider border-r border-border/50">
          Etapa
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex" style={{ minWidth: `${totalDays * 40}px` }}>
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={i}
                  className={cn(
                    "w-10 shrink-0 px-1 py-2 text-center border-r border-border/30",
                    isWeekend && "bg-surface-hover/30",
                    isToday && "bg-accent/10",
                  )}
                >
                  <div className={cn("text-[10px]", isToday ? "text-accent font-bold" : "text-text-muted")}>
                    {format(day, "EEE", { locale: ptBR })}
                  </div>
                  <div className={cn("text-xs font-medium", isToday ? "text-accent" : "text-text-main")}>
                    {format(day, "dd")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Linhas por coluna */}
      <div className="flex-1 overflow-y-auto">
        {colunas.map((coluna, colIndex) => {
          const tarefasDaColuna = getTarefasPorColuna(coluna.id);
          if (tarefasDaColuna.length === 0) return null;

          return (
            <div key={coluna.id} className="flex border-b border-border/30">
              <div className={cn(
                "w-56 shrink-0 px-4 py-3 border-r border-border/50 flex items-center gap-2",
                "bg-gradient-to-r",
                getColunaColor(colIndex),
              )}>
                <div className="w-2 h-2 rounded-full bg-accent/60" />
                <span className="text-sm font-semibold text-text-main truncate">{coluna.titulo}</span>
                <span className="text-xs text-text-muted ml-auto">{tarefasDaColuna.length}</span>
              </div>
              <div className="flex-1 relative" style={{ minWidth: `${totalDays * 40}px`, minHeight: "52px" }}>
                {/* Grid lines */}
                {days.map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-r border-border/20"
                    style={{ left: `${(i / totalDays) * 100}%`, width: 0 }}
                  />
                ))}

                {/* Today line */}
                {days.map((day, i) => {
                  if (!isSameDay(day, new Date())) return null;
                  return (
                    <div
                      key="today"
                      className="absolute top-0 bottom-0 w-0.5 bg-accent/60 z-10"
                      style={{ left: `${((i + 0.5) / totalDays) * 100}%` }}
                    />
                  );
                })}

                {/* Task bars */}
                {tarefasDaColuna.map((tarefa) => {
                  const pos = getBarPosition(tarefa);
                  const colors = PRIORITY_COLORS[tarefa.prioridade] || PRIORITY_COLORS.medium;
                  return (
                    <div
                      key={tarefa.id}
                      className={cn(
                        "absolute top-1.5 h-8 rounded-md border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg z-20 flex items-center px-2 gap-1.5",
                        colors.bg,
                        colors.border,
                      )}
                      style={{ left: pos.left, width: pos.width, minWidth: "24px" }}
                      onClick={() => setEditingTask(tarefa)}
                      title={tarefa.titulo}
                    >
                      <span className={cn("text-xs font-medium truncate", colors.text)}>
                        {tarefa.titulo}
                      </span>
                      {tarefa.completed_at && (
                        <span className="text-emerald-400 text-xs">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {editingTask && (
        <TaskModal
          funilId={funil.id}
          columnId={editingTask.coluna_id}
          task={editingTask}
          allTasks={tarefas}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
