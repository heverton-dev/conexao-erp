import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { FunilTarefa } from "../types";
import { TaskCard } from "./TaskCard";

type SwimlaneGroupProps = {
  label: string;
  tarefas: FunilTarefa[];
  onTaskClick: (tarefa: FunilTarefa) => void;
  defaultCollapsed?: boolean;
};

export function SwimlaneGroup({
  label,
  tarefas,
  onTaskClick,
  defaultCollapsed = false,
}: SwimlaneGroupProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (tarefas.length === 0) return null;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 w-full text-left px-1 py-1 hover:bg-surface/30 rounded transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/60 ml-auto">
          {tarefas.length}
        </span>
      </button>
      {!collapsed && (
        <div className="space-y-2 pl-2">
          {tarefas.map((tarefa) => (
            <TaskCard
              key={tarefa.id}
              tarefa={tarefa}
              onClick={() => onTaskClick(tarefa)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
