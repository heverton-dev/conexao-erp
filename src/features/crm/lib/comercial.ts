// Utilitários genéricos — vivem em ~/lib/utils/format
export { formatBRL, formatDate } from "~/lib/utils/format";

export type Temperatura = "Frio" | "Morno" | "Quente";

export function sugerirTemperatura({
  gerou_pedido,
  gerou_orcamento,
  interesse_escala,
}: {
  gerou_pedido: boolean;
  gerou_orcamento: boolean;
  interesse_escala: number;
}): Temperatura {
  if (gerou_pedido || interesse_escala >= 4) return "Quente";
  if (gerou_orcamento || interesse_escala === 3) return "Morno";
  return "Frio";
}
