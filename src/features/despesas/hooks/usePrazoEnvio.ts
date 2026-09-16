import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import { buscarPeriodo } from "../services/periodos.service";
import { buscarConfig } from "../services/config.service";

interface PrazoEnvio {
  dentroDoPrazo: boolean;
  prazoExpirado: boolean;
  deadline: Date | null;
  diasRestantes: number;
  isLoading: boolean;
}

export function usePrazoEnvio(
  periodo_id?: string,
  overrideEmpresaId?: string,
): PrazoEnvio {
  const { profile } = useAuth();
  const empresa_id = overrideEmpresaId || EMPRESA_ID;

  const { data: periodo } = useQuery({
    queryKey: ["despesa-periodo", periodo_id],
    queryFn: async () => {
      if (!periodo_id) return null;
      return buscarPeriodo(periodo_id);
    },
    enabled: !!periodo_id,
  });

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["despesa-config", empresa_id],
    queryFn: () => buscarConfig(),
    enabled: !!empresa_id,
  });

  if (!periodo_id || !periodo || !config) {
    return {
      dentroDoPrazo: true,
      prazoExpirado: false,
      deadline: null,
      diasRestantes: 0,
      isLoading: configLoading,
    };
  }

  const dataFim = new Date(periodo.data_fim + "T23:59:59");
  const deadline = new Date(dataFim);
  deadline.setDate(deadline.getDate() + config.dia_envio);

  const hoje = new Date();
  const diff = deadline.getTime() - hoje.getTime();
  const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return {
    dentroDoPrazo: diff > 0,
    prazoExpirado: diff <= 0,
    deadline,
    diasRestantes: Math.max(0, diasRestantes),
    isLoading: configLoading,
  };
}
