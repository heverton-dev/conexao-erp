import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Funil, FunilTarefa } from "../types";
import { TaskModal } from "./TaskModal";
import { cn } from "~/lib/utils";

type CalendarViewProps = {
  funil: Funil;
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const PRIORITY_BG: Record<string, string> = {
  urgent: "bg-red-500/15 border-red-500/30",
  high: "bg-orange-500/15 border-orange-500/30",
  medium: "bg-amber-500/15 border-amber-500/30",
  low: "bg-emerald-500/15 border-emerald-500/30",
};

export function CalendarView({ funil }: CalendarViewProps) {
  const tarefas = funil.tarefas ?? [];
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTask, setEditingTask] = useState<FunilTarefa | null>(null);

  const tarefasComDeadline = useMemo(() => {
    return tarefas.filter((t) => !t.parent_task_id && t.data_fim);
  }, [tarefas]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const getTarefasDoDia = (day: Date) => {
    return tarefasComDeadline.filter((t) => {
      if (!t.data_fim) return false;
      return isSameDay(new Date(t.data_fim), day);
    });
  };

  const getWeekDayLabels = () => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header do calendário */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-text-main"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-text-main capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-text-main"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Grid do calendário */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-border/50 shrink-0">
          {getWeekDayLabels().map((label) => (
            <div key={label} className="px-2 py-2 text-center text-xs font-bold text-text-muted uppercase tracking-wider border-r border-border/30 last:border-r-0">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {calendarDays.map((day, idx) => {
            const dayTasks = getTarefasDoDia(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <div
                key={idx}
                className={cn(
                  "border-r border-b border-border/30 last:border-r-0 p-1 min-h-[90px]",
                  !isCurrentMonth && "bg-surface-hover/20",
                  isTodayDate && "bg-accent/5",
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  isTodayDate
                    ? "bg-accent text-accent-fg font-bold"
                    : isCurrentMonth
                      ? "text-text-main"
                      : "text-text-muted/50",
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((tarefa) => (
                    <button
                      key={tarefa.id}
                      onClick={() => setEditingTask(tarefa)}
                      className={cn(
                        "w-full text-left px-1.5 py-0.5 rounded border text-[10px] font-medium truncate transition-all hover:scale-[1.02]",
                        PRIORITY_BG[tarefa.prioridade] || PRIORITY_BG.medium,
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", PRIORITY_DOT[tarefa.prioridade] || PRIORITY_DOT.medium)} />
                        {tarefa.titulo}
                      </span>
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-text-muted text-center">
                      +{dayTasks.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border/50 shrink-0">
        <span className="text-[10px] text-text-muted font-medium">Legenda:</span>
        {Object.entries(PRIORITY_DOT).map(([key, color]) => (
          <span key={key} className="flex items-center gap-1 text-[10px] text-text-muted">
            <span className={cn("w-2 h-2 rounded-full", color)} />
            {key === "urgent" ? "Urgente" : key === "high" ? "Alta" : key === "medium" ? "Média" : "Baixa"}
          </span>
        ))}
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
