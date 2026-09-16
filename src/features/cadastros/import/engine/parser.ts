import type { ClienteCsvRow } from "../types";
import { CLIENTE_CSV_CONFIG } from "../constants";

export function parseClienteCsv(text: string): { headers: string[]; rows: ClienteCsvRow[] } {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV vazio ou sem dados de exemplo");

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ClienteCsvRow[] = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row as unknown as ClienteCsvRow;
  });

  return { headers, rows };
}

export function generateClienteTemplate(): string {
  const header = CLIENTE_CSV_CONFIG.templateHeaders.map((h) => h.label).join(",");
  const example = CLIENTE_CSV_CONFIG.templateHeaders.map((h) => h.example).join(",");
  return `${header}\n${example}\n`;
}
