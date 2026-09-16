import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import { buscarPeriodoAtual } from "../services/periodos.service";

export function usePeriodoAtual(overrideEmpresaId?: string) {
  const { profile } = useAuth();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  return useQuery({
    queryKey: ["despesa-periodo-atual", empresa_id],
    queryFn: () => buscarPeriodoAtual(),
    enabled: !!empresa_id,
  });
}
