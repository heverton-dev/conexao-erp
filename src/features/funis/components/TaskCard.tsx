import {
  Calendar,
  AlertTriangle,
  Clock,
  Flag,
  CheckCircle2,
} from "lucide-react";
import type { FunilTarefa } from "../types";
import {
  priorityMeta,
  statusMeta,
  deadlineStatus,
  type Priority,
} from "~/lib/task-meta";
import { Badge } from "~/components/ui/badge";

type TaskCardProps = {
  tarefa: FunilTarefa;
  onClick: () => void;
};

export function TaskCard({ tarefa, onClick }: TaskCardProps) {
  const pMeta = priorityMeta((tarefa.prioridade as Priority) || "medium");
  const isCompleted = !!tarefa.completed_at;
  const dStatus = deadlineStatus({
    data_fim: tarefa.data_fim,
    completed_at: tarefa.completed_at,
  });
  const sMeta = statusMeta[dStatus];

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("tarefaId", tarefa.id);
      }}
      onClick={onClick}
      className={`group p-4 rounded-xl border-2 bg-surface shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${isCompleted ? "border-emerald-500/30 bg-emerald-500/10" : "border-border/60 hover:border-primary/50"}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4
          className={`text-sm font-medium leading-tight ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
        >
          {tarefa.titulo}
        </h4>
        {isCompleted && (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        )}
      </div>

      {tarefa.descricao && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {tarefa.descricao}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge
          variant="outline"
          className={`gap-1 px-1.5 py-0 text-[10px] ${pMeta.chip}`}
        >
          <Flag className="h-2.5 w-2.5" />
          {pMeta.label}
        </Badge>

        {tarefa.data_fim && !isCompleted && (
          <Badge
            variant="outline"
            className={`gap-1 px-1.5 py-0 text-[10px] ${sMeta.chip}`}
          >
            <Clock className="h-2.5 w-2.5" />
            {sMeta.label}
          </Badge>
        )}

        {tarefa.tools && tarefa.tools.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {tarefa.tools.slice(0, 2).map((tool) => (
              <span
                key={tool}
                className="px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[9px] font-medium tracking-wide"
              >
                {tool}
              </span>
            ))}
            {tarefa.tools.length > 2 && (
              <span className="text-[9px] text-muted-foreground px-1">
                +{tarefa.tools.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
