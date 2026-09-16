import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moverTarefa, atualizarTarefa, deletarTarefa } from "../services";

export function useBulkActions(funilId: string) {
  const qc = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const selectedCount = selectedIds.size;

  const moverEmMassa = useMutation({
    mutationFn: async (colunaId: string) => {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id, idx) => moverTarefa(id, colunaId, idx)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funil", funilId] });
      clearSelection();
    },
  });

  const atribuirEmMassa = useMutation({
    mutationFn: async (userId: string | null) => {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) => atualizarTarefa(id, { atribuido_para: userId })),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funil", funilId] });
      clearSelection();
    },
  });

  const prioridadeEmMassa = useMutation({
    mutationFn: async (prioridade: string) => {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) => atualizarTarefa(id, { prioridade: prioridade as any })),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funil", funilId] });
      clearSelection();
    },
  });

  const excluirEmMassa = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => deletarTarefa(id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funil", funilId] });
      clearSelection();
    },
  });

  return {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    moverEmMassa,
    atribuirEmMassa,
    prioridadeEmMassa,
    excluirEmMassa,
  };
}
