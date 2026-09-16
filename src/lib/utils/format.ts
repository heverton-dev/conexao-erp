/**
 * Utilitários de formatação genéricos compartilhados entre módulos.
 * Não pertencem a nenhum módulo de negócio específico.
 */

export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(
    date + (date.length === 10 ? "T00:00:00" : ""),
  ).toLocaleDateString("pt-BR");
}
