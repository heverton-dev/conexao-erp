import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarRespostas, excluirRespostas } from "../services/respostas";

export function useRespostas(
  empresaId: string,
  filtros?: {
    dateFrom?: string;
    dateTo?: string;
    vendorFilter?: string;
    npsBucket?: string;
  },
) {
  return useQuery({
    queryKey: ["nps", "respostas", empresaId, filtros],
    queryFn: () => listarRespostas(empresaId, filtros),
    enabled: !!empresaId,
  });
}

export function useExcluirRespostas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids }: { ids: string[] }) => excluirRespostas(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nps", "respostas"] });
    },
  });
}
