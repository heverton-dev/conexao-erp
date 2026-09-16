import { cn } from "~/lib/utils";
import {
  DESPESA_STATUS_LABEL,
  DESPESA_STATUS_COLOR,
  ENVIO_STATUS_LABEL,
  ENVIO_STATUS_COLOR,
  PAGAMENTO_STATUS_LABEL,
  PAGAMENTO_STATUS_COLOR,
} from "../../types";
import type { DespesaStatus, EnvioStatus, PagamentoStatus } from "../../types";

export function DespesaStatusBadge({ status }: { status: DespesaStatus }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        DESPESA_STATUS_COLOR[status],
      )}
    >
      {DESPESA_STATUS_LABEL[status]}
    </span>
  );
}

export function EnvioStatusBadge({ status }: { status: EnvioStatus }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        ENVIO_STATUS_COLOR[status],
      )}
    >
      {ENVIO_STATUS_LABEL[status]}
    </span>
  );
}

export function PagamentoStatusBadge({ status }: { status: PagamentoStatus }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        PAGAMENTO_STATUS_COLOR[status],
      )}
    >
      {PAGAMENTO_STATUS_LABEL[status]}
    </span>
  );
}
