import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useCriarTarefa, useMoverTarefa } from "../hooks/useFunisData";
import type { Funil, FunilTarefa } from "../types";
import { ColumnHeader } from "./ColumnHeader";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";

type KanbanViewProps = {
  funil: Funil;
};

export function KanbanView({ funil }: KanbanViewProps) {
  const criarTarefa = useCriarTarefa();
  const moverTarefa = useMoverTarefa();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColunaId, setSelectedColunaId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<FunilTarefa | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const colunas = funil.colunas ?? [];
  const tarefas = funil.tarefas ?? [];

  const handleAddTask = (colunaId: string) => {
    setSelectedColunaId(colunaId);
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (tarefa: FunilTarefa) => {
    setEditingTask(tarefa);
    setSelectedColunaId(tarefa.coluna_id);
    setShowTaskModal(true);
  };

  const handleCreateTask = async (data: {
    titulo: string;
    descricao?: string;
    prioridade?: string;
  }) => {
    if (!selectedColunaId) return;
    await criarTarefa.mutateAsync({
      funil_id: funil.id,
      coluna_id: selectedColunaId,
      titulo: data.titulo,
      descricao: data.descricao,
      prioridade: data.prioridade as any,
    });
    setShowTaskModal(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColunaId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const tarefaId = e.dataTransfer.getData("tarefaId");
    if (!tarefaId) return;

    await moverTarefa.mutateAsync({
      tarefaId,
      novaColunaId: targetColunaId,
      novaPosicao: 999,
    });
  };

  return (
    <div className="flex gap-4 px-4 pb-4 overflow-x-auto h-full items-stretch w-full">
      {colunas.map((coluna) => {
        const colunaTarefas = tarefas
          .filter((t) => t.coluna_id === coluna.id && !t.parent_task_id)
          .sort((a, b) => a.posicao - b.posicao);

        return (
          <div
            key={coluna.id}
            className="flex-shrink-0 flex-grow flex-1 min-w-[280px] max-w-[450px] flex flex-col bg-surface/50 rounded-xl border border-border/30 backdrop-blur-sm overflow-hidden"
          >
            <ColumnHeader coluna={coluna} funilId={funil.id} />
            <div
              className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px] transition-colors ${dragOverCol === coluna.id ? "bg-primary/10 border-2 border-dashed border-primary/50 rounded-lg m-2" : ""}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, coluna.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, coluna.id)}
            >
              {colunaTarefas.map((tarefa) => (
                <TaskCard
                  key={tarefa.id}
                  tarefa={tarefa}
                  onClick={() => handleEditTask(tarefa)}
                />
              ))}
            </div>
            <div className="p-2 border-t border-border-subtle">
              <Button
                onClick={() => handleAddTask(coluna.id)}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-text-muted"
              >
                <Plus className="w-4 h-4" />
                Adicionar tarefa
              </Button>
            </div>
          </div>
        );
      })}

      {showTaskModal && (
        <TaskModal
          funilId={funil.id}
          columnId={selectedColunaId!}
          task={editingTask}
          allTasks={tarefas}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
}
